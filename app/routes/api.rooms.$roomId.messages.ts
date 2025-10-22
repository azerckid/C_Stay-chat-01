import { type LoaderFunctionArgs, data } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);
    const { roomId } = params;

    if (!roomId) {
        throw data({ error: "Room ID is required" }, { status: 400 });
    }

    try {
        // 1. 내가 이 방의 멤버인지 확인 (보안)
        const membership = await prisma.roomMember.findFirst({
            where: {
                roomId: roomId,
                userId: user.id
            }
        });

        if (!membership) {
            throw data({ error: "접근 권한이 없습니다." }, { status: 403 });
        }

        // 2. 메시지 내역 조회 with Pagination (일단 전체 조회)
        const messages = await prisma.message.findMany({
            where: { roomId: roomId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        avatarUrl: true
                    }
                }
            }
        });

        return { messages };

    } catch (error) {
        console.error("Failed to fetch messages:", error);
        throw data({ error: "메시지를 불러오지 못했습니다." }, { status: 500 });
    }
}
