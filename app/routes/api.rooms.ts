import { type LoaderFunctionArgs, type ActionFunctionArgs, data } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import crypto from "node:crypto";

// [GET] 내 채팅방 목록 조회
// ... (loader code remains same, skipping for space but will include in tool call)
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

        const formattedRooms = rooms.map(room => {
            const otherMember = room.members.find(m => m.userId !== user.id)?.user;
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
        const targetUserId = formData.get("targetUserId") as string;
        const targetEmail = formData.get("targetEmail") as string;

        let partnerId = targetUserId;

        if (targetEmail) {
            let targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });

            if (!targetUser && targetEmail.includes("@staync.com")) {
                const { getAgentByEmail } = await import("~/lib/ai-agents");
                const agent = getAgentByEmail(targetEmail);
                targetUser = await prisma.user.create({
                    data: {
                        email: targetEmail,
                        name: agent.name,
                        avatarUrl: agent.avatarUrl,
                        emailVerified: true,
                        status: "ONLINE"
                    }
                });
            }
            if (targetUser) partnerId = targetUser.id;
        }

        if (!partnerId && !targetEmail) {
            const aiUser = await prisma.user.findFirst({
                where: { email: "ai@staync.com" }
            });
            if (aiUser) partnerId = aiUser.id;
        }

        if (!partnerId) {
            return data({ error: "대화 상대를 찾을 수 없습니다." }, { status: 400 });
        }

        const existingRoom = await prisma.room.findFirst({
            where: {
                type: "DIRECT",
                AND: [
                    { members: { some: { userId: user.id } } },
                    { members: { some: { userId: partnerId } } }
                ]
            }
        });

        if (existingRoom) {
            return { success: true, roomId: existingRoom.id };
        }

        const partner = await prisma.user.findUnique({ where: { id: partnerId } });
        const roomId = crypto.randomUUID();

        // [Fix] SQLite NOT NULL constraint for conversationId
        // Room, Conversation, Message를 하나의 트랜잭션으로 생성
        const newRoom = await prisma.$transaction(async (tx) => {
            // 1. Room 생성
            const room = await tx.room.create({
                data: {
                    id: roomId,
                    type: "DIRECT",
                    name: partner?.name || "AI Assistant",
                    members: {
                        create: [
                            { userId: user.id, role: "OWNER" },
                            { userId: partnerId, role: "MEMBER" }
                        ]
                    }
                }
            });

            // 2. 호환성 유지를 위한 Conversation 생성 (필수)
            await tx.conversation.create({
                data: {
                    id: roomId,
                    title: room.name || "AI Assistant",
                    userId: user.id
                }
            });

            // 3. 첫 메시지 생성 (conversationId 포함)
            const greeting = targetEmail && targetEmail.includes("@staync.com")
                ? (await import("~/lib/ai-agents")).getAgentByEmail(targetEmail).greeting
                : "대화가 시작되었습니다.";

            await tx.message.create({
                data: {
                    roomId: roomId,
                    conversationId: roomId,
                    content: greeting,
                    type: "TEXT",
                    senderId: partnerId,
                    role: "assistant"
                }
            });

            return room;
        });

        return { success: true, roomId: newRoom.id };

    } catch (error) {
        console.error("Failed to create room:", error);
        return data({ error: "채팅방을 생성하지 못했습니다." }, { status: 500 });
    }
}
