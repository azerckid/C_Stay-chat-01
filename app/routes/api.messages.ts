import { type ActionFunctionArgs } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { pusherServer } from "~/lib/pusher.server";
import { getAgentByEmail, AI_AGENTS } from "~/lib/ai-agents";

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);
    const formData = await request.formData();

    const roomId = formData.get("roomId") as string;
    const content = formData.get("content") as string;
    const type = (formData.get("type") as string) || "TEXT";

    if (!roomId || !content) {
        return { error: "Missing required fields" };
    }

    try {
        // 1. 유저 메시지 저장 및 즉시 반환 (속도 최우선)
        const userMessage = await prisma.message.create({
            data: {
                roomId,
                senderId: user.id,
                content,
                type,
                role: "user",
                conversationId: roomId
            },
            include: {
                sender: { select: { id: true, name: true, image: true, avatarUrl: true } }
            }
        });

        // 2. Pusher 비동기 전송
        pusherServer.trigger(`room-${roomId}`, "new-message", {
            ...userMessage,
            createdAt: userMessage.createdAt.toISOString()
        }).catch(e => console.error("Pusher Error:", e));

        // 3. AI 답변 트리거 (기다리지 않음)
        handleAIResponse(roomId, content, user.id).catch(err => {
            console.error("AI Response Error:", err);
        });

        return { success: true };
    } catch (error) {
        console.error("Message Action Error:", error);
        return { error: "Failed to send message" };
    }
}

async function handleAIResponse(roomId: string, userMessage: string, senderId: string) {
    try {
        // AI 답변을 위해 필요한 최소한의 정보만 로드
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: {
                members: {
                    select: { user: { select: { id: true, name: true, email: true, avatarUrl: true, image: true } } }
                }
            }
        });
        if (!room) return;

        const aiMember = room.members.find(m => m.user.email.endsWith("@staync.com"));
        if (!aiMember) return;

        const aiUser = aiMember.user;
        const agent = getAgentByEmail(aiUser.email);
        if (senderId === aiUser.id) return;

        // Typing Indicator 즉시 전송
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: aiUser.id,
            userName: aiUser.name || agent.name,
            isTyping: true
        });

        // 대화 내역 로드 (필요한 필드만 선택해서 속도 향상)
        const history = await prisma.message.findMany({
            where: { roomId: roomId },
            orderBy: { createdAt: "desc" },
            take: 10, // 히스토리 개수를 약간 줄여서 쿼리 속도 향상
            select: { content: true, senderId: true }
        });
        const sortedHistory = history.reverse();

        // 시스템 지침 구성
        const otherAgentsInfo = AI_AGENTS
            .filter((a: any) => a.id !== agent.id)
            .map((a: any) => `- ${a.countryCode} Expert: ${a.name} (Specialties: ${a.specialties.join(", ")})`)
            .join("\n");

        const bubbleSplitRule = `[TECHNICAL PROTOCOL: UI_MESSAGE_STREAMING & EXPERTISE_GUARDRAIL]
[TERRITORY] Your domain is the ENTIRE country of ${agent.countryCode}.
[LANGUAGE] You MUST reply in the EXACT SAME LANGUAGE as the user (e.g., KOREAN).
[BUBBLES] Use "---" after the 1st sentence and major sections. Keep each bubble short.
[REDIRECTIONS] Only redirect if strictly about another country:
${otherAgentsInfo}

[PERSONA] ${agent.persona}
Start with a brief intro in User's Language, then "---".`;

        const contents = sortedHistory.map(msg => ({
            role: (msg.senderId === aiUser.id ? "model" : "user") as "model" | "user",
            parts: [{ text: msg.content }]
        }));

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: bubbleSplitRule + `\nCRITICAL: Answer in user's language. Territory: ${agent.countryCode}.` }] },
                generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
            })
        });

        if (!response.ok) return;

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        const streamingId = `ai-stream-${Date.now()}`;

        if (!reader) return;

        // 타이핑 중지
        await pusherServer.trigger(`room-${roomId}`, "user-typing", { userId: aiUser.id, isTyping: false });

        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data: ")) continue;

                try {
                    const data = JSON.parse(trimmed.substring(6));
                    const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

                    if (textChunk) {
                        fullContent += textChunk;
                        // 딜레이 없이 즉시 전송하여 네트워크 지연 상쇄
                        await pusherServer.trigger(`room-${roomId}`, "ai-streaming", {
                            id: streamingId,
                            content: fullContent,
                            senderId: aiUser.id,
                            sender: { name: aiUser.name, image: aiUser.avatarUrl || aiUser.image }
                        });
                    }
                } catch (e) { }
            }
        }

        // 답변 최종 저장 (비동기로 처리해서 유저 대기 시간 없음)
        prisma.message.create({
            data: {
                roomId,
                senderId: aiUser.id,
                content: fullContent,
                role: "assistant",
                conversationId: roomId
            }
        }).catch(e => console.error("Final Save Error:", e));

    } catch (error) {
        console.error("[AI Logic Error]:", error);
        pusherServer.trigger(`room-${roomId}`, "user-typing", { userId: senderId, isTyping: false }).catch(() => { });
    }
}
