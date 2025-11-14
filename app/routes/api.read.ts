
import { type ActionFunctionArgs, json } from "@react-router/node";
import { db } from "~/lib/db.server";
import { getSession } from "~/lib/auth.server";
import { pusherServer } from "~/lib/pusher.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const session = await getSession(request.headers.get("Cookie"));
    const user = session.get("user");

    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const roomId = formData.get("roomId");

    if (typeof roomId !== "string") {
        return json({ error: "Invalid room ID" }, { status: 400 });
    }

    // 1. 해당 방의 '상대방이 보낸 + 안 읽은' 메시지를 모두 읽음 처리
    const updatedBatch = await db.message.updateMany({
        where: {
            roomId: roomId,
            senderId: { not: user.id }, // 내가 보낸 건 제외
            read: false,
        },
        data: {
            read: true,
        },
    });

    // 2. 업데이트된 게 있다면 Pusher로 '읽음' 이벤트 발송
    if (updatedBatch.count > 0) {
        await pusherServer.trigger(`room-${roomId}`, "read-receipt", {
            userId: user.id, // 누가 읽었는지
            roomId: roomId,
        });
    }

    return json({ success: true, count: updatedBatch.count });
};
