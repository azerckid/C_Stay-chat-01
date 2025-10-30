import { type ActionFunctionArgs, data } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { pusherServer } from "~/lib/pusher.server";

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    const formData = await request.formData();
    const roomId = formData.get("roomId") as string;
    const isTyping = formData.get("isTyping") === "true";

    if (!roomId) {
        return data({ error: "Room ID is required" }, { status: 400 });
    }

    try {
        console.log(`[Typing API] User ${user.email} is ${isTyping ? "typing..." : "stopped typing"} in room ${roomId}`);

        await pusherServer.trigger(`room-${roomId}`, "user-typing", {
            userId: user.id,
            userName: user.name,
            isTyping: isTyping,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to trigger typing event:", error);
        return data({ error: "Failed to broadcast typing" }, { status: 500 });
    }
}
