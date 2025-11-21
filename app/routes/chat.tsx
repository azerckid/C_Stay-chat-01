import { useState, useEffect } from "react";
import { type LoaderFunctionArgs, type ActionFunctionArgs, useLoaderData, useFetcher, useNavigate } from "react-router";
import { SafeArea, AppHeader, BottomNav } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { ChatListItem } from "~/components/chat/chat-list-item";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon, UserIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    // 1. 내 채팅방 목록
    const rooms = await prisma.room.findMany({
        where: { members: { some: { userId: user.id } } },
        include: {
            members: { include: { user: true } },
            messages: { orderBy: { createdAt: "desc" }, take: 1 }
        },
        orderBy: { updatedAt: "desc" }
    });

    // 2. 대화 가능한 유저 목록 (본인 제외)
    // 실제 서비스에서는 친구 목록이어야 함
    const otherUsers = await prisma.user.findMany({
        where: { id: { not: user.id } },
        select: { id: true, name: true, email: true, avatarUrl: true }
    });

    return {
        user,
        rooms: rooms.map(room => {
            const otherMember = room.members.find(m => m.userId !== user.id)?.user;
            return {
                id: room.id,
                title: room.name || otherMember?.name || "알 수 없음",
                image: otherMember?.image || otherMember?.avatarUrl,
                lastMessage: room.messages[0]?.content || "대화를 시작해보세요.",
                updatedAt: room.updatedAt.toISOString(),
                unreadCount: 0 // 추후 구현
            };
        }),
        potentialUsers: otherUsers
    };
}

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);
    const formData = await request.formData();
    const intent = formData.get("intent");

    // 1. 채팅방 생성 (AI 또는 유저)
    if (intent === "createRoom") {
        const targetUserId = formData.get("targetUserId") as string;

        // 이미 존재하는 방인지 확인 (1:1)
        const myRooms = await prisma.roomMember.findMany({ where: { userId: user.id }, select: { roomId: true } });
        const targetRooms = await prisma.roomMember.findMany({ where: { userId: targetUserId }, select: { roomId: true } });

        // 교집합 찾기 (단순화: 2명인 방만)
        let existRoomId = null;
        for (const mr of myRooms) {
            if (targetRooms.some(tr => tr.roomId === mr.roomId)) {
                const count = await prisma.roomMember.count({ where: { roomId: mr.roomId } });
                if (count === 2) {
                    existRoomId = mr.roomId;
                    break;
                }
            }
        }

        if (existRoomId) return { success: true, roomId: existRoomId };

        // 없으면 생성
        const newRoom = await prisma.room.create({
            data: {
                members: {
                    create: [
                        { userId: user.id },
                        { userId: targetUserId }
                    ]
                }
            }
        });
        return { success: true, roomId: newRoom.id };
    }

    // 2. 채팅방 나가기 (삭제)
    if (intent === "leaveRoom") {
        const roomId = formData.get("roomId") as string;
        if (!roomId) return null;

        // 멤버에서 제거
        await prisma.roomMember.deleteMany({
            where: { roomId, userId: user.id }
        });

        // 멤버가 0명이면 방 자체를 삭제 (옵션)
        const count = await prisma.roomMember.count({ where: { roomId } });
        if (count === 0) {
            await prisma.room.delete({ where: { id: roomId } });
        }

        return { success: true, actionType: "leave" };
    }

    return null;
}

export default function ChatListPage() {
    const { user, rooms, potentialUsers } = useLoaderData<typeof loader>();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
    const fetcher = useFetcher();

    // fetcher 응답 감지 (토스트 및 UI 처리)
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            const data = fetcher.data as any;
            if (data.success && data.actionType === "leave") {
                toast.success("채팅방에서 나갔습니다.");
                setDeleteRoomId(null);
            }
        }
    }, [fetcher.state, fetcher.data]);

    const handleCreateChat = (targetUserId: string) => {
        setIsUserModalOpen(false);
        fetcher.submit(
            { intent: "createRoom", targetUserId },
            { method: "post" }
        );
    };

    const confirmDeleteRoom = () => {
        if (!deleteRoomId) return;
        fetcher.submit(
            { intent: "leaveRoom", roomId: deleteRoomId },
            { method: "post" }
        );
    };

    return (
        <SafeArea className="bg-background">
            <AppHeader title="Messages" showBack={false} />

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pt-20 pb-24">
                {rooms.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70 mt-20">
                        <p className="text-white/60">진행 중인 대화가 없습니다.</p>
                        <p className="text-sm text-white/40">새 대화를 시작해보세요.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {rooms.map((room) => (
                            <motion.div
                                key={room.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative group rounded-2xl overflow-hidden"
                            >
                                <ChatListItem {...room} image={room.image ?? undefined} />

                                {/* 삭제 버튼 오버레이: hover 시 날짜(우측 상단)를 가림 */}
                                <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#1c1c1e] from-60% to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pl-4 pointer-events-none group-hover:pointer-events-auto">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDeleteRoomId(room.id);
                                        }}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
                                    >
                                        <HugeiconsIcon icon={Delete02Icon} size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* FAB */}
            <div className="fixed bottom-24 right-6 z-20">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserModalOpen(true)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center shadow-lg shadow-neon-purple/30 text-white"
                >
                    <HugeiconsIcon icon={Add01Icon} size={28} strokeWidth={2} />
                </motion.button>
            </div>

            {/* User List Modal */}
            <AnimatePresence>
                {isUserModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                            onClick={() => setIsUserModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-x-4 top-[20%] max-h-[50%] bg-[#1c1c1e] z-50 rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h3 className="text-lg font-bold text-white">새로운 대화</h3>
                                <button onClick={() => setIsUserModalOpen(false)} className="text-sm text-zinc-400">취소</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {potentialUsers.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500">대화 가능한 유저가 없습니다.</div>
                                ) : (
                                    potentialUsers.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleCreateChat(u.id)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center">
                                                {u.avatarUrl ? (
                                                    <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-white/50">{u.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{u.name}</div>
                                                <div className="text-xs text-zinc-500">{u.email}</div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteRoomId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setDeleteRoomId(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-sm bg-[#1c1c1e] rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
                            >
                                <div className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                        <HugeiconsIcon icon={AlertCircleIcon} size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">채팅방 나가기</h3>
                                        <p className="text-sm text-zinc-400">
                                            정말 나가시겠습니까? <br />
                                            대화 내용은 복구할 수 없습니다.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full pt-2">
                                        <button
                                            onClick={() => setDeleteRoomId(null)}
                                            className="flex-1 py-3 rounded-xl bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={confirmDeleteRoom}
                                            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
                                        >
                                            나가기
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav />
        </SafeArea>
    );
}
