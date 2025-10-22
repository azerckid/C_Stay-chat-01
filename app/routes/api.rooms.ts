import { type LoaderFunctionArgs, type ActionFunctionArgs, data } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";

// [GET] 내 채팅방 목록 조회
export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    try {
        const rooms = await prisma.room.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                                image: true,
                                status: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        // 프론트엔드에서 쓰기 좋게 데이터 가공
        const formattedRooms = rooms.map(room => {
            // 1:1 채팅인 경우 상대방 정보를 찾음
            const otherMember = room.members.find(m => m.userId !== user.id)?.user;

            // 방 이름이 없으면 상대방 이름 사용, 그것도 없으면 "알 수 없음"
            const displayTitle = room.name || otherMember?.name || "새로운 채팅";
            const displayImage = otherMember?.image || otherMember?.avatarUrl || "/placeholder-avatar.png";

            return {
                id: room.id,
                title: displayTitle,
                image: displayImage,
                lastMessage: room.messages[0]?.content || "대화가 없습니다.",
                updatedAt: room.updatedAt,
                type: room.type,
                memberCount: room.members.length
            };
        });

        return { rooms: formattedRooms };

    } catch (error) {
        console.error("Failed to fetch rooms:", error);
        throw data({ error: "채팅방 목록을 불러오지 못했습니다." }, { status: 500 });
    }
}

// [POST] 새 채팅방 생성 (AI 또는 다른 유저와)
export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    try {
        const formData = await request.formData();
        const targetUserId = formData.get("targetUserId") as string; // 대화할 상대방 (없으면 AI)

        let partnerId = targetUserId;

        // 상대방 ID가 없으면 'AI'를 찾음 (seed 데이터 기반)
        if (!partnerId) {
            const aiUser = await prisma.user.findFirst({
                where: { email: "ai@staync.com" }
            });
            if (aiUser) partnerId = aiUser.id;
        }

        if (!partnerId) {
            return data({ error: "대화 상대를 찾을 수 없습니다." }, { status: 400 });
        }

        // 이미 존재하는 1:1 방이 있는지 확인 (중복 생성 방지)
        // (Prisma 쿼리가 복잡하므로, 여기서는 단순하게 생략하거나 나중에 최적화)
        // 일단은 매번 새로 만드는 대신, 기존 방이 있으면 그걸 리턴하는 로직이 이상적임.

        // 새 방 생성
        const newRoom = await prisma.room.create({
            data: {
                type: "DIRECT",
                members: {
                    create: [
                        { userId: user.id, role: "OWNER" },
                        { userId: partnerId, role: "MEMBER" }
                    ]
                },
                messages: {
                    create: {
                        content: "대화가 시작되었습니다.",
                        type: "SYSTEM",
                        senderId: partnerId // 시스템 메시지처럼 보이게 AI가 보낸 걸로 처리
                    }
                }
            }
        });

        return { success: true, roomId: newRoom.id };

    } catch (error) {
        console.error("Failed to create room:", error);
        return data({ error: "채팅방을 생성하지 못했습니다." }, { status: 500 });
    }
}
