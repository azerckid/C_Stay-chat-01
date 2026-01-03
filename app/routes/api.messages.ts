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
        // 1. 유저 메시지 저장
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
                sender: {
                    select: { id: true, name: true, image: true, avatarUrl: true }
                }
            }
        });

        // 2. Pusher 전송
        await pusherServer.trigger(`room-${roomId}`, "new-message", {
            ...userMessage,
            createdAt: userMessage.createdAt.toISOString()
        });

        // 3. AI 응답 처리 (백그라운드에서 실행)
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
        // 1. 방 정보 로드 및 해당 방에 속한 AI 멤버 찾기
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { members: { include: { user: true } } }
        });
        if (!room) return;

        // [@staync.com] 도메인을 가진 진짜 AI 멤버를 찾습니다.
        const aiMember = room.members.find(m => m.user.email.endsWith("@staync.com"));

        // 방에 AI 멤버가 없다면 일반 대화방이므로 답변하지 않고 종료합니다.
        if (!aiMember || !aiMember.user) {
            console.log(`[AI Guard] No AI agent found in room ${roomId}. Skipping response.`);
            return;
        }

        const aiUser = aiMember.user;
        const agent = getAgentByEmail(aiUser.email);

        // 자기가 보낸 메시지에는 응답하지 않음 (무한 루프 방지)
        if (senderId === aiUser.id) return;

        console.log(`[AI Logic] ${agent.name} is responding in room ${roomId}...`);

        // 2. Typing Indicator ON
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: aiUser.id,
            userName: aiUser.name || agent.name,
            isTyping: true
        });

        const history = await prisma.message.findMany({
            where: { roomId: roomId },
            orderBy: { createdAt: "desc" },
            take: 15,
            include: { sender: true }
        });
        const sortedHistory = history.reverse();

        const otherAgentsInfo = AI_AGENTS
            .filter((a: any) => a.id !== agent.id)
            .map((a: any) => `- ${a.countryCode} Expert: ${a.name} (Specialties: ${a.specialties.join(", ")})`)
            .join("\n");

        const bubbleSplitRule = `[TECHNICAL PROTOCOL: UI_MESSAGE_STREAMING & EXPERTISE_GUARDRAIL]
You are part of a multi-bubble chat system. Your output is parsed by a STACK of bubbles. 

[STRICT EXPERTISE GUARDRAIL]
- Your domain is the ENTIRE country of ${agent.countryCode}.
- USE YOUR INTERNAL KNOWLEDGE: Before responding, determine if the user's query pertains to a location or topic within ${agent.countryCode}. If it does, you ARE the expert and you MUST provide a full, detailed response.
- DO NOT be restricted by the 'Specialties' list.
- REDIRECT ONLY IF: The query is explicitly about a DIFFERENT country:
${otherAgentsInfo}

[LANGUAGE ENFORCEMENT]
- You MUST reply in the EXACT SAME LANGUAGE as the user's message (e.g., Korean for Korean users).
- No other languages unless the user does.

[STRICT BUBBLE RULE]
- Divide your response with "---" after the intro and between major sections.
- Keep each bubble under 3 sentences.

[Agent Persona]
${agent.persona}

Start with a brief intro in User's Language, then "---".`;

        const systemInstructionContent = [bubbleSplitRule, `CRITICAL: 1. Use the KOREAN language if the user is using Korean. 2. Use "---" after the first sentence and every 2-3 sentences. 3. Your territory is strictly ${agent.countryCode}.`].join("\n\n");

        const contents = sortedHistory.map(msg => ({
            role: (msg.senderId === aiUser.id ? "model" : "user") as "model" | "user",
            parts: [{ text: msg.content }]
        }));

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing");

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: systemInstructionContent }] },
                generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
            })
        });

        if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        const streamingId = `ai-stream-${Date.now()}`;

        if (!reader) return;

        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: aiUser.id,
            isTyping: false
        });

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
                        const chars = textChunk.split("");
                        for (const char of chars) {
                            fullContent += char;
                            await pusherServer.trigger(`room-${roomId}`, "ai-streaming", {
                                id: streamingId,
                                content: fullContent,
                                senderId: aiUser.id,
                                sender: { name: aiUser.name, image: aiUser.avatarUrl || aiUser.image } // 프로필 이미지 호환성
                            });
                            if (chars.length > 1) await new Promise(r => setTimeout(r, 10));
                        }
                    }
                } catch (e) { }
            }
        }

        await prisma.message.create({
            data: {
                roomId,
                senderId: aiUser.id,
                content: fullContent,
                type: "TEXT",
                role: "assistant",
                conversationId: roomId
            }
        });

    } catch (error) {
        console.error("[AI Logic Error]:", error);
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: senderId,
            isTyping: false
        }).catch(() => { });
    }
}
