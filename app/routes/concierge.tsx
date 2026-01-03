import { useState, useEffect } from "react";
import { type LoaderFunctionArgs, useLoaderData, useNavigate, useFetcher } from "react-router";
import { SafeArea, BottomNav } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { ChatListItem } from "~/components/chat/chat-list-item";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, AiChat01Icon } from "@hugeicons/core-free-icons";
import { AI_AGENTS } from "~/lib/ai-agents";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    const aiEmails = AI_AGENTS.map(agent => agent.email);

    // AI들과의 채팅방 조회
    const aiRooms = await prisma.room.findMany({
        where: {
            members: {
                some: { userId: user.id }
            }
        },
        include: {
            members: {
                include: { user: true }
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        },
        orderBy: { updatedAt: "desc" }
    });

    // AI 에이전트 중 한 명이라도 포함된 방만 필터링
    const filteredRooms = aiRooms.filter(room => {
        return room.members.some(m => aiEmails.includes(m.user?.email || ""));
    });

    return {
        user,
        rooms: filteredRooms.map(room => {
            const aiMember = room.members.find(m => aiEmails.includes(m.user?.email || ""));
            return {
                id: room.id,
                title: room.name || aiMember?.user?.name || "AI Assistant",
                image: aiMember?.user?.avatarUrl,
                lastMessage: room.messages[0]?.content || "대화를 시작해보세요.",
                updatedAt: room.updatedAt.toISOString(),
                unreadCount: 0
            };
        })
    };
}

export default function ConciergePage() {
    const { user, rooms } = useLoaderData<typeof loader>();
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const fetcher = useFetcher();

    // fetcher 결과에 따라 채팅방으로 이동 - useEffect로 처리
    useEffect(() => {
        if (fetcher.data && (fetcher.data as any).success && (fetcher.data as any).roomId) {
            navigate(`/chat/${(fetcher.data as any).roomId}`);
        }
    }, [fetcher.data, navigate]);

    // 검색 필터링
    const filteredRooms = rooms.filter(room =>
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdvisorClick = (agentEmail: string) => {
        const formData = new FormData();
        formData.append("targetEmail", agentEmail);
        fetcher.submit(formData, { method: "post", action: "/api/rooms" });
    };

    return (
        <SafeArea className="bg-[#F3F4F6] dark:bg-[#111827] flex flex-col">
            {/* Header - Search */}
            <header className="px-6 pb-2 pt-4 bg-[#F3F4F6] dark:bg-[#111827] z-10 sticky top-0">
                <div className="w-full relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HugeiconsIcon icon={SearchIcon} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Ask about destinations, flights..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all duration-200"
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-20 space-y-3">
                {/* Travel Advisors */}
                <div className="mb-4 pt-2">
                    <div className="flex justify-between items-baseline px-2 mb-3">
                        <h2 className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                            Travel Advisors
                        </h2>
                        <span className="text-xs font-medium text-primary cursor-pointer hover:underline">View all</span>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 px-2">
                        {AI_AGENTS.map((agent) => (
                            <div
                                key={agent.id}
                                onClick={() => handleAdvisorClick(agent.email)}
                                className="flex flex-col items-center space-y-1 min-w-[64px] cursor-pointer group"
                            >
                                <div className="relative transition-transform duration-200 group-hover:scale-105">
                                    <img
                                        alt={agent.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 p-0.5 border-transparent group-hover:border-primary transition-colors"
                                        src={agent.avatarUrl}
                                    />
                                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center text-xs shadow-sm">
                                        {agent.flag}
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-[#111827] dark:text-[#F9FAFB] truncate w-16 text-center">
                                    {agent.name.split(" ")[0]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Consultations */}
                <div>
                    <h2 className="px-2 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-2">
                        Active Consultations
                    </h2>
                    {filteredRooms.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70 mt-20">
                            <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                                {searchQuery ? "검색 결과가 없습니다." : "진행 중인 AI 상담이 없습니다."}
                            </p>
                            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] opacity-70">
                                {searchQuery ? "다른 검색어를 시도해보세요." : "새 AI 상담을 시작해보세요."}
                            </p>
                        </div>
                    ) : (
                        filteredRooms.map((room) => (
                            <ChatListItem key={room.id} {...room} image={room.image ?? undefined} />
                        ))
                    )}
                </div>
            </main>

            {/* FAB - Stitch Design */}
            <button
                onClick={() => {
                    // 메인 AI 컨시어지 채팅방으로 이동
                    handleAdvisorClick("ai@staync.com");
                }}
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 z-30"
            >
                <HugeiconsIcon icon={AiChat01Icon} size={28} strokeWidth={2} />
            </button>

            <BottomNav />
        </SafeArea>
    );
}
