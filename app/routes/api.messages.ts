import { type ActionFunctionArgs, data } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { pusherServer } from "~/lib/pusher.server";

// AI 관련 Import
import { orchestratorGraph } from "~/agents/orchestrator/graph";
import { HumanMessage } from "@langchain/core/messages";

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
                sender: {
                    select: { id: true, name: true, image: true, avatarUrl: true }
                }
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
        // 사용자가 보낸 메시지에 대해 AI가 대답해야 하는지 확인하고 처리
        void handleAIResponse(roomId, content, user.id);

        return { success: true, message: newMessage };

    } catch (error) {
        console.error("Failed to send message:", error);
        return data({ error: "메시지 전송 실패" }, { status: 500 });
    }
}

/**
 * AI 응답 처리 함수 (Background Process)
 * - 방에 AI가 있는지 확인
 * - 있으면 LangGraph 호출
 * - 결과 DB 저장 및 Pusher 전송
 */
async function handleAIResponse(roomId: string, userMessage: string, senderId: string) {
    try {
        const AI_EMAIL = "ai@staync.com";
        const AI_NAME = "STAYnC Concierge";

        // 1. 방 정보 및 AI 유저 존재 여부 확인
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { members: { include: { user: true } } }
        });
        if (!room) return;

        // DB에서 AI 유저 찾기
        let aiUser = await prisma.user.findUnique({ where: { email: AI_EMAIL } });

        // 없으면 자동 생성 (Self-healing)
        if (!aiUser) {
            console.log("[AI] Creating AI Bot User...");
            aiUser = await prisma.user.create({
                data: {
                    email: AI_EMAIL,
                    name: AI_NAME,
                    avatarUrl: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png", // 로봇 아이콘
                }
            });
        }

        // 2. 이 방에 AI가 있는지 확인
        const isAiInRoom = room.members.some(m => m.userId === aiUser!.id);

        // *조건*: AI가 멤버로 있거나, 방 이름이 'Concierge'를 포함하면 응답
        if (!isAiInRoom) {
            // 이번 데모에서는 AI가 없는 방이면 조용히 리턴
            return;
        }

        // 내가 AI라면 무시 (Loop 방지)
        if (senderId === aiUser.id) return;

        console.log(`[AI] Processing message in room ${roomId}...`);

        // 3. Typing Indicator ON
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: aiUser.id,
            userName: aiUser.name,
            isTyping: true
        });

        // 4. LangGraph 실행 (AI 생각 중...)
        const result = await orchestratorGraph.invoke({
            messages: [new HumanMessage(userMessage)]
        });

        const lastMessage = result.messages[result.messages.length - 1];
        let aiResponseContent = lastMessage.content as string;

        console.log(`[AI] Generated response: ${aiResponseContent.substring(0, 50)}...`);

        // 5. Typing Indicator OFF
        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: aiUser.id,
            userName: aiUser.name,
            isTyping: false
        });

        // 6. DB 저장 (AI 메시지)
        // JSON 응답인 경우 처리는 UI에서 담당 (마크다운 코드블록 그대로 저장)
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

        // 7. 실시간 전송 (Pusher)
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
