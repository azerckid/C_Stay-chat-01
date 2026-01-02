import { useState } from "react";
import { type LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { SafeArea, BottomNav } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { ChatListItem } from "~/components/chat/chat-list-item";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, AiChat01Icon } from "@hugeicons/core-free-icons";
import { formatMessageTime } from "~/lib/date-utils";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    const AI_EMAIL = "ai@staync.com";

    // AI 유저 찾기
    const aiUser = await prisma.user.findUnique({ where: { email: AI_EMAIL } });

    // AI와의 채팅방만 필터링
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

    // AI가 포함된 방만 필터링
    const filteredRooms = aiRooms.filter(room => {
        if (!aiUser) return false;
        return room.members.some(m => m.userId === aiUser.id);
    });

    return {
        user,
        rooms: filteredRooms.map(room => {
            const aiMember = room.members.find(m => m.user?.email === AI_EMAIL);
            return {
                id: room.id,
                title: room.name || aiMember?.user?.name || "AI Assistant",
                image: aiMember?.user?.avatarUrl,
                lastMessage: room.messages[0]?.content || "대화를 시작해보세요.",
                updatedAt: room.updatedAt.toISOString(),
                unreadCount: 0 // 추후 구현
            };
        })
    };
}

export default function ConciergePage() {
    const { user, rooms } = useLoaderData<typeof loader>();
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // 검색 필터링
    const filteredRooms = rooms.filter(room =>
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Travel Advisors 샘플 데이터
    const travelAdvisors = [
        {
            id: 1,
            name: "Japan",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyYodtk-whXz4Y5egGjYhdKYrSuMZHsBXM-DlRbJeb_amFXra6mqzw2W_xClT2-ajwKqYPfcSgieDYhkpNCs0Z7VO3WRTG5msEu9sdowimTni103ho_KSOowEGA-IhoLVXyWZyptXuRjXqmKgV3sDyceWkZuSafLI_wd48HPflEwaAvE7NPwaOBkh1mGi1yBMWHhKBf1c4R09YIVu--GLB6DNv74K0e2KJvslzrx2_tGUgwDWjlmsdqHPYfj4IFafAyZA3Q2t8M-WP",
            flag: "🇯🇵",
            isActive: true
        },
        {
            id: 2,
            name: "Italy",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC51gEys_ouqlI3nVnYVm5_A8t60LG9n0bOQkWpCktf4bgwzAbACdH3nYfpnrSUnVfiDTpUPIfTXaltZe9sNTFD6SgeUTRFVGQGluZd5QnvxjiOld7BDQyDV3YEZ4XRHUaM9Ema0gkmY_PUD89oh-7bBp4hzeGxf9beSZY4fT4wmlrrCE8-e-MaDyB37yjIMdc0z3IZdsewI2aphngWGR7PD5h1LY9tBdX1_YT6DXPJIoZo8ym43hUYlLU6w5v7xtbkxYIq1XvcHo9J",
            flag: "🇮🇹",
            isActive: false
        },
        {
            id: 3,
            name: "France",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA4TjzAltj03-YtRpYgmaf-aBx2DdY8F2UWHUbBr-FUsLTUwFHA_lidyT3pja7cdS2r6Hbh5jXShNT4NvRjQxaHz-v_hUDVtD8y4ocDtMwq_LCKlAeIhTSKURCUtg8-CYv11yXY7IHDfNm1Z-0A2hwEw0Bstfohz1xRqEl-0wb9UwgkP2wm60t_GGdpMfhm2L-59BEpdDv0xyKrU4YaHOCkK_7QXuYavGEpbbZNKwH4X3HsaBG9b77qnNuoYcjPj14yZrCL9iowvNb",
            flag: "🇫🇷",
            isActive: false
        }
    ];

    const handleAdvisorClick = (advisorId: number) => {
        // TODO: 특정 어드바이저와 채팅 시작
        console.log("Advisor clicked:", advisorId);
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
                        {travelAdvisors.map((advisor) => (
                            <div
                                key={advisor.id}
                                onClick={() => handleAdvisorClick(advisor.id)}
                                className="flex flex-col items-center space-y-1 min-w-[64px] cursor-pointer group"
                            >
                                <div className="relative transition-transform duration-200 group-hover:scale-105">
                                    <img
                                        alt={`${advisor.name} Advisor`}
                                        className={`w-16 h-16 rounded-full object-cover border-2 p-0.5 ${advisor.isActive ? "border-primary" : "border-transparent"}`}
                                        src={advisor.image}
                                    />
                                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center text-xs shadow-sm">
                                        {advisor.flag}
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-[#111827] dark:text-[#F9FAFB] truncate w-16 text-center">
                                    {advisor.name}
                                </span>
                            </div>
                        ))}
                        <div className="flex flex-col items-center space-y-1 min-w-[64px] cursor-pointer group">
                            <div className="relative transition-transform duration-200 group-hover:scale-105">
                                <div className="w-16 h-16 rounded-full bg-white dark:bg-[#1F2937] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:border-primary hover:text-primary transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] truncate w-16 text-center">
                                New Trip
                            </span>
                        </div>
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
                    navigate("/concierge");
                }}
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 z-30"
            >
                <HugeiconsIcon icon={AiChat01Icon} size={28} strokeWidth={2} />
            </button>

            <BottomNav />
        </SafeArea>
    );
}
