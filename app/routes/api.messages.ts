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
        const newMessage = await prisma.message.create({
            data: {
                roomId,
                senderId: user.id,
                content,
                type
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
        void handleAIResponse(roomId, content, user.id);

        return { success: true, message: newMessage };

    } catch (error) {
        console.error("Failed to send message:", error);
        return data({ error: "메시지 전송 실패" }, { status: 500 });
    }
}

/**
 * AI 응답 처리 함수 - LangChain 대신 fetch로 직접 구현 (안정성 확보)
 */
async function handleAIResponse(roomId: string, userMessage: string, senderId: string) {
    try {
        const AI_EMAIL = "ai@staync.com";
        const AI_NAME = "STAYnC Concierge";
        const API_KEY = process.env.OPENAI_API_KEY;

        if (!API_KEY) {
            console.error("[AI] OPENAI_API_KEY is missing!");
            return;
        }

        // 1. 방 정보 및 AI 유저 존재 여부 확인
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { members: { include: { user: true } } }
        });
        if (!room) return;

        // DB에서 AI 유저 찾기
        let aiUser = await prisma.user.findUnique({ where: { email: AI_EMAIL } });

        // 없으면 자동 생성
        if (!aiUser) {
            aiUser = await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    email: AI_EMAIL,
                    name: AI_NAME,
                    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
                    emailVerified: true,
                    status: "ONLINE"
                }
            });
        }

        // 2. 이 방에 AI가 있는지 확인
        const isAiInRoom = room.members.some(m => m.userId === aiUser!.id);
        if (!isAiInRoom || senderId === aiUser!.id) return;

        // 3. Typing Indicator ON
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: aiUser.id,
            userName: aiUser.name,
            isTyping: true
        });

        // 4. 컨텍스트 로드 (최근 10개)
        const history = await prisma.message.findMany({
            where: { roomId: roomId },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { sender: true }
        });
        const sortedHistory = history.reverse();

        // 5. OpenAI 메시지 포맷으로 변환
        const messagesForLLM = sortedHistory.map(msg => ({
            role: msg.senderId === aiUser!.id ? "assistant" : "user",
            content: msg.content.length > 500 ? msg.content.slice(0, 500) + "..." : msg.content
        })).filter(m => m.content && m.content.trim() !== "");

        // 최신 메시지가 혹시 안 들어갔으면 추가 (보통 DB create 직후라 들어가있음)
        const lastMsg = messagesForLLM[messagesForLLM.length - 1];
        if (!lastMsg || lastMsg.content !== userMessage) {
            // 중복 아니면 추가 (근데 보통 중복임)
            // 여기서는 일단 있는 그대로 둠.
        }

        // 시스템 프롬프트 추가
        messagesForLLM.unshift({
            role: "system",
            content: "You are STAYnC AI, a helpful travel concierge. Answer shortly and kindly."
        });

        console.log(`[AI] Sending ${messagesForLLM.length} messages to OpenAI API...`);

        // 5. OpenAI API 호출 (Native Fetch)
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messagesForLLM,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[AI] OpenAI API Error: ${response.status} - ${errText}`);
            throw new Error("OpenAI API Failed");
        }

        const data = await response.json();
        const aiResponseContent = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

        console.log(`[AI] Response: ${aiResponseContent.substring(0, 50)}...`);

        // 6. DB 저장 (AI 메시지)
        const aiMessage = await prisma.message.create({
            data: {
                roomId,
                senderId: aiUser!.id,
                content: aiResponseContent,
                type: "TEXT"
            },
            include: {
                sender: { select: { id: true, name: true, image: true, avatarUrl: true } }
            }
        });

        // 7. Typing Indicator OFF & New Message Trigger
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: aiUser.id,
            userName: aiUser.name,
            isTyping: false
        });

        await pusherServer.trigger(`room-${roomId}`, "new-message", {
            id: aiMessage.id,
            content: aiMessage.content,
            senderId: aiMessage.senderId,
            createdAt: aiMessage.createdAt.toISOString(),
            type: aiMessage.type,
            sender: {
                name: aiMessage.sender.name,
                image: aiMessage.sender.image
            }
        });

    } catch (error) {
        console.error("[Handle AI Response] Error:", error);
    }
}
