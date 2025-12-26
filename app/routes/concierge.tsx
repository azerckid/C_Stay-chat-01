import { type LoaderFunctionArgs, redirect } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    const AI_EMAIL = "ai@staync.com";
    const AI_NAME = "STAYnC Concierge";

    // 1. AI 유저 찾기 (없으면 생성)
    let aiUser = await prisma.user.findUnique({ where: { email: AI_EMAIL } });

    if (!aiUser) {
        aiUser = await prisma.user.create({
            data: {
                id: crypto.randomUUID(), // ID 필수 생성
                email: AI_EMAIL,
                name: AI_NAME,
                avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
                emailVerified: true,
                status: "ONLINE"
            }
        });
    }

    // 2. 나와 AI가 1:1로 있는 방 찾기
    // (RoomMember를 통해 교집합 찾기)
    const myRooms = await prisma.roomMember.findMany({
        where: { userId: user.id },
        select: { roomId: true }
    });

    const aiRooms = await prisma.roomMember.findMany({
        where: { userId: aiUser.id },
        select: { roomId: true }
    });

    // 교집합 Room ID 찾기
    let targetRoomId: string | null = null;

    // 단순 무식하게 비교 (성능 최적화는 나중에)
    for (const myRoom of myRooms) {
        if (aiRooms.some(aiRoom => aiRoom.roomId === myRoom.roomId)) {
            // 멤버가 딱 2명인지 확인 (다인톡방 방지)
            const count = await prisma.roomMember.count({ where: { roomId: myRoom.roomId } });
            if (count === 2) {
                targetRoomId = myRoom.roomId;
                break;
            }
        }
    }

    // 3. 방이 없으면 생성
    if (!targetRoomId) {
        const newRoom = await prisma.room.create({
            data: {
                name: "STAYnC Concierge",
                members: {
                    create: [
                        { userId: user.id },
                        { userId: aiUser.id }
                    ]
                }
            }
        });

        // AI가 환영 메시지 선톡
        await prisma.message.create({
            data: {
                roomId: newRoom.id,
                senderId: aiUser.id,
                content: "안녕하세요! 여행 계획을 도와드리는 AI 컨시어지입니다. 무엇을 도와드릴까요? ✈️",
                type: "TEXT",
                role: "assistant"
            }
        });

        targetRoomId = newRoom.id;
    }

    // 4. 채팅방으로 이동
    return redirect(`/chat/${targetRoomId}`);
}
