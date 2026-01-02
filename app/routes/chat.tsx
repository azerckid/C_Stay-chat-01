import { useState, useEffect } from "react";
import { type LoaderFunctionArgs, type ActionFunctionArgs, useLoaderData, useFetcher, useNavigate } from "react-router";
import { SafeArea, BottomNav } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { ChatListItem } from "~/components/chat/chat-list-item";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, UserIcon, AlertCircleIcon, SearchIcon } from "@hugeicons/core-free-icons";
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
    const [searchQuery, setSearchQuery] = useState("");
    const fetcher = useFetcher();
    const navigate = useNavigate();

    // fetcher 응답 감지 (토스트 및 UI 처리)
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            const data = fetcher.data as any;
            if (data.success && data.roomId) {
                navigate(`/chat/${data.roomId}`);
            } else if (data.success && data.actionType === "leave") {
                toast.success("채팅방에서 나갔습니다.");
                setDeleteRoomId(null);
            }
        }
    }, [fetcher.state, fetcher.data, navigate]);

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

    // 검색 필터링
    const filteredRooms = rooms.filter(room =>
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeArea className="bg-[#F3F4F6] dark:bg-[#111827] flex flex-col">
            {/* Stitch Design Header */}
            <header className="px-6 py-4 bg-[#F3F4F6] dark:bg-[#111827] z-10 sticky top-0">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="flex flex-col items-center pt-2">
                        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB] tracking-tight">
                            People Chats
                        </h1>
                        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                            Connect with friends & colleagues
                        </p>
                    </div>
                    <div className="w-full relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HugeiconsIcon icon={SearchIcon} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all duration-200"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-20 space-y-3">
                {/* Favorites Section */}
                {!searchQuery && (
                    <div className="mb-4 pt-2">
                        <h2 className="px-2 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-3">
                            Favorites
                        </h2>
                        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 px-2">
                            {rooms.slice(0, 3).map((room, index) => {
                                const isFirst = index === 0;
                                return (
                                    <div
                                        key={room.id}
                                        onClick={() => navigate(`/chat/${room.id}`)}
                                        className="flex flex-col items-center space-y-1 min-w-[64px] cursor-pointer"
                                    >
                                        <div className="relative">
                                            {room.image ? (
                                                <img
                                                    alt={room.title}
                                                    className={`w-16 h-16 rounded-full object-cover border-2 p-0.5 ${isFirst ? "border-primary" : "border-transparent"}`}
                                                    src={room.image}
                                                />
                                            ) : (
                                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 p-0.5 ${isFirst ? "border-primary" : "border-transparent"}`}>
                                                    {room.title.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#111827] rounded-full" />
                                        </div>
                                        <span className="text-xs font-medium text-[#111827] dark:text-[#F9FAFB] truncate w-16 text-center">
                                            {room.title.split(" ")[0]}
                                        </span>
                                    </div>
                                );
                            })}
                            <div
                                onClick={() => setIsUserModalOpen(true)}
                                className="flex flex-col items-center space-y-1 min-w-[64px] cursor-pointer"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full bg-white dark:bg-[#1F2937] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:border-primary hover:text-primary transition-colors">
                                        <HugeiconsIcon icon={Add01Icon} className="w-6 h-6" />
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] truncate w-16 text-center">
                                    Add New
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Messages Section */}
                {filteredRooms.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70 mt-20">
                        <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                            {searchQuery ? "검색 결과가 없습니다." : "진행 중인 대화가 없습니다."}
                        </p>
                        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] opacity-70">
                            {searchQuery ? "다른 검색어를 시도해보세요." : "새 대화를 시작해보세요."}
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2 className="px-2 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-2">
                            Recent Messages
                        </h2>
                        {filteredRooms.map((room) => (
                            <ChatListItem key={room.id} {...room} image={room.image ?? undefined} />
                        ))}
                    </div>
                )}
            </main>

            {/* FAB - Stitch Design */}
            <button
                onClick={() => setIsUserModalOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 z-30"
            >
                <HugeiconsIcon icon={Add01Icon} size={28} strokeWidth={2} />
            </button>

            {/* User List Modal - Stitch Design */}
            {isUserModalOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        onClick={() => setIsUserModalOpen(false)}
                    />
                    <div className="fixed inset-x-4 top-[20%] max-h-[50%] bg-white dark:bg-[#1F2937] z-50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB]">새로운 대화</h3>
                            <button
                                onClick={() => setIsUserModalOpen(false)}
                                className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors"
                            >
                                취소
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {potentialUsers.length === 0 ? (
                                <div className="p-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">대화 가능한 유저가 없습니다.</div>
                            ) : (
                                potentialUsers.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleCreateChat(u.id)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                                            {u.avatarUrl ? (
                                                <img src={u.avatarUrl} alt={u.name || undefined} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{(u.name || "U").charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">{u.name}</div>
                                            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{u.email}</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal - Stitch Design */}
            {deleteRoomId && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setDeleteRoomId(null)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                    <HugeiconsIcon icon={AlertCircleIcon} size={28} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#111827] dark:text-[#F9FAFB] mb-1">채팅방 나가기</h3>
                                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                                        정말 나가시겠습니까? <br />
                                        대화 내용은 복구할 수 없습니다.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full pt-2">
                                    <button
                                        onClick={() => setDeleteRoomId(null)}
                                        className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-[#111827] dark:text-[#F9FAFB] font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
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
                        </div>
                    </div>
                </>
            )}

            <BottomNav />
        </SafeArea>
    );
}
