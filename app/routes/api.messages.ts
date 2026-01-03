import { type ActionFunctionArgs, data } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { pusherServer } from "~/lib/pusher.server";

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    try {
        const formData = await request.formData();
        const roomId = formData.get("roomId") as string;
        const content = formData.get("content") as string;
        const type = (formData.get("type") as string) || "TEXT";

        if (!roomId || !content) {
            return data({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. 권한 체크
        const membership = await prisma.roomMember.findFirst({
            where: { roomId, userId: user.id }
        });

        if (!membership) {
            return data({ error: "Unauthorized" }, { status: 403 });
        }

        // 2. 메시지 저장
        // 안전장치: Conversation 존재 여부 확인 및 생성 (기존 앱 호환성)
        try {
            const conversation = await prisma.conversation.findUnique({ where: { id: roomId } });
            if (!conversation) {
                await prisma.conversation.create({
                    data: {
                        id: roomId,
                        title: "Chat Room" // Remote DB: NOT NULL
                    }
                });
            }
        } catch (e) {
            console.log("Conversation check/create failed:", e);
        }

        const newMessage = await prisma.message.create({
            data: {
                roomId,
                senderId: user.id,
                content,
                type,
                role: "user",
                conversationId: roomId // 기존 앱 호환성
            },
            include: {
                sender: { select: { id: true, name: true, image: true, avatarUrl: true } }
            }
        });

        // 3. 채팅방 UpdatedAt 갱신
        await prisma.room.update({
            where: { id: roomId },
            data: { updatedAt: new Date() }
        });

        // 4. 실시간 이벤트 발송 (Pusher)
        try {
            await pusherServer.trigger(`room-${roomId}`, "new-message", {
                id: newMessage.id,
                content: newMessage.content,
                senderId: newMessage.senderId,
                createdAt: newMessage.createdAt.toISOString(),
                type: newMessage.type,
                sender: {
                    name: newMessage.sender.name,
                    image: newMessage.sender.image
                }
            });
        } catch (error) {
            console.error("[Pusher Trigger] Failed ❌:", error);
        }

        // 5. AI 응답 처리 (비동기)
        // 🔥 Critical: AI가 있다고 가정하고 미리 Typing Indicator를 쏩니다. (UX 향상)
        // 실제 AI 로직 안에서 AI 유저를 찾아서 쏘려면 늦을 수 있음.
        const AI_EMAIL = "ai@staync.com";
        const aiUser = await prisma.user.findUnique({ where: { email: AI_EMAIL } });

        if (aiUser) {
            // AI가 이 방에 있는지 확인 (최적화)
            const isAiInRoom = await prisma.roomMember.findFirst({
                where: { roomId, userId: aiUser.id }
            });

            if (isAiInRoom) {
                await pusherServer.trigger(`room-${roomId}`, "user-typing", {
                    userId: aiUser.id,
                    userName: aiUser.name || "AI Concierge",
                    isTyping: true
                });
            }
        }

        void handleAIResponse(roomId, content, user.id);

        return { success: true, message: newMessage };

    } catch (error) {
        console.error("Failed to send message:", error);
        return data({ error: "메시지 전송 실패" }, { status: 500 });
    }
}

/**
 * AI 응답 처리 함수 - 답변을 생성한 후 '---' 기준으로 쪼개어 하나씩 발송
 */
async function handleAIResponse(roomId: string, userMessage: string, senderId: string) {
    try {
        const API_KEY = process.env.OPENAI_API_KEY;
        const { getAgentByEmail } = await import("~/lib/ai-agents");

        if (!API_KEY) {
            console.error("[AI] OPENAI_API_KEY is missing!");
            return;
        }

        // 1. 방 정보 로드 및 AI 멤버 찾기
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { members: { include: { user: true } } }
        });
        if (!room) return;

        const aiMember = room.members.find(m => m.user?.email && (m.user.email.includes("@staync.com")));
        if (!aiMember || !aiMember.user) return;

        const aiUser = aiMember.user;
        const agent = getAgentByEmail(aiUser.email);

        if (senderId === aiUser.id) return;

        // 2. Typing Indicator ON
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: aiUser.id,
            userName: aiUser.name,
            isTyping: true
        });

        // 3. 컨텍스트 로드
        const history = await prisma.message.findMany({
            where: { roomId: roomId },
            orderBy: { createdAt: "desc" },
            take: 15,
            include: { sender: true }
        });
        const sortedHistory = history.reverse();

        const messagesForLLM = sortedHistory.map(msg => ({
            role: msg.senderId === aiUser.id ? "assistant" : "user",
            content: msg.content.length > 1000 ? msg.content.slice(0, 1000) + "..." : msg.content
        })).filter(m => m.content && m.content.trim() !== "");

        // [핵심] 시스템 프롬프트: AI를 위한 절대적인 기술적 프로토콜
        const bubbleSplitRule = `[TECHNICAL PROTOCOL: UI_MESSAGE_STREAMING]
You are part of a multi-bubble chat system. Your output is parsed by a STACK of bubbles. 

STRICT RULE:
- If your response is longer than 150 characters, you MUST provide at least 2 separators ("---").
- ALWAYS put "---" immediately after your first introductory sentence.
- NEVER send more than 3 sentences in a single bubble.
- Use "---" independently on its own line for best results.

Example Protocol:
안녕하세요! 여행 전문가입니다. 비엔나를 추천해 드릴게요.
---
### 🏛️ 주요 명소
첫 번째 명소는...
---
### 🍴 추천 음식
맛있는 음식은...

[Agent Persona]
${agent.persona}

Always reply in the user's language. Use markdown. Use "---" as the bridge between bubbles.`;

        messagesForLLM.unshift({
            role: "system",
            content: bubbleSplitRule
        });

        // 답변 직전에 마지막으로 '명령'을 박아넣음
        messagesForLLM.push({
            role: "system",
            content: "CRITICAL: Start with a brief intro, then immediately use '---'. Divide long steps with '---' regularly."
        });

        console.log(`[AI - ${agent.name}] Protocol-based streaming start...`);

        // 4. OpenAI API 호출 (Streaming 모드)
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messagesForLLM,
                temperature: 0.8,
                stream: true // ✨ 스트리밍 활성화
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenAI Error: ${response.status} - ${errText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        const streamingId = `ai-stream-${Date.now()}`;

        if (!reader) return;

        // 스트리밍 시작 시 타이핑 인디케이터 일단 OFF (텍스트 버블이 나오기 시작하므로)
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: aiUser.id,
            userName: aiUser.name,
            isTyping: false
        });

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ") && line !== "data: [DONE]") {
                    try {
                        const data = JSON.parse(line.substring(6));
                        const content = data.choices[0]?.delta?.content || "";
                        if (content) {
                            fullContent += content;

                            // 5. 실시간 스트리밍 발송
                            await pusherServer.trigger(`room-${roomId}`, "ai-streaming", {
                                id: streamingId,
                                content: fullContent,
                                senderId: aiUser.id,
                                sender: { name: aiUser.name, image: aiUser.avatarUrl }
                            });
                        }
                    } catch (e) { }
                }
            }
        }

        // 6. 전체 메시지 DB 저장 (나중에 쪼개서 로딩될 때를 위해 원본 저장)
        const aiMessage = await prisma.message.create({
            data: {
                roomId,
                senderId: aiUser.id,
                content: fullContent,
                type: "TEXT",
                role: "assistant",
                conversationId: roomId
            },
            include: {
                sender: { select: { id: true, name: true, image: true, avatarUrl: true } }
            }
        });

        // 7. 완료 신호
        await pusherServer.trigger(`room-${roomId}`, "new-message", {
            id: aiMessage.id,
            streamingId: streamingId,
            content: aiMessage.content,
            senderId: aiMessage.senderId,
            createdAt: aiMessage.createdAt.toISOString(),
            sender: {
                name: aiMessage.sender.name,
                image: aiMessage.sender.image
            }
        });

    } catch (error) {
        console.error("[AI Streaming Error]:", error);
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: senderId,
            isTyping: false
        }).catch(() => { });
    }
}
