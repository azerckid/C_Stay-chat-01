import { type ActionFunctionArgs, data } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    try {
        const formData = await request.formData();
        const roomId = formData.get("roomId") as string;
        const content = formData.get("content") as string;

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
                type: "TEXT"
            },
            include: {
                sender: {
                    select: { id: true, name: true, image: true, avatarUrl: true }
                }
            }
        });

        // 3. 채팅방 UpdatedAt 갱신 (목록 정렬용)
        await prisma.room.update({
            where: { id: roomId },
            data: { updatedAt: new Date() }
        });

        // TODO: Pusher로 실시간 이벤트 발송
        // TODO: AI가 있는 방이라면 AI 답변 트리거

        return { success: true, message: newMessage };

    } catch (error) {
        console.error("Failed to send message:", error);
        return data({ error: "메시지 전송 실패" }, { status: 500 });
    }
}
