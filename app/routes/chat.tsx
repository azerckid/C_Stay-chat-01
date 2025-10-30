import { type LoaderFunctionArgs, useLoaderData, Form, useNavigation } from "react-router";
import { SafeArea, AppHeader, BottomNav } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { ChatListItem } from "~/components/chat/chat-list-item";
import { motion, AnimatePresence } from "framer-motion";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    // 내 채팅방 목록 조회 (최신순)
    const rooms = await prisma.room.findMany({
        where: {
            members: { some: { userId: user.id } }
        },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true, avatarUrl: true }
                    }
                }
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        },
        orderBy: { updatedAt: "desc" }
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
                updatedAt: room.updatedAt.toISOString(), // Date -> string 변환
                unreadCount: 0
            };
        })
    };
}

export async function action({ request }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);

    // AI와의 1:1 채팅방 생성 로직
    const aiUser = await prisma.user.findFirst({ where: { email: "ai@staync.com" } });
    if (!aiUser) return null; // 에러 처리 필요

    const newRoom = await prisma.room.create({
        data: {
            type: "DIRECT",
            members: {
                create: [
                    { userId: user.id, role: "OWNER" },
                    { userId: aiUser.id, role: "MEMBER" }
                ]
            },
            messages: {
                create: {
                    content: "안녕하세요! STAYnC 프리미엄 컨시어지입니다. 무엇을 도와드릴까요?",
                    type: "SYSTEM",
                    senderId: aiUser.id
                }
            }
        }
    });

    return { success: true, newRoomId: newRoom.id };
}

export default function ChatListPage() {
    const { user, rooms } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isCreating = navigation.state === "submitting" && navigation.formMethod === "POST";

    return (
        <SafeArea className="bg-background">
            <AppHeader title="Messages" showBack={false} />

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {rooms.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70 mt-20">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 1.657-1.343 3-3 3H9.828a2 2 0 01-1.414-.586l-2.828-2.828A2 2 0 004.172 6H4a2 2 0 00-2 2v10a2 2 0 002 2h17a2 2 0 002-2v-3a2 2 0 00-2-2z" />
                            </svg>
                        </div>
                        <p className="text-white/60">진행 중인 대화가 없습니다.</p>
                        <p className="text-sm text-white/40">아래 버튼을 눌러 AI 컨시어지와 대화를 시작하세요.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {rooms.map((room) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                layout
                            >
                                <ChatListItem
                                    {...room}
                                    image={room.image ?? undefined}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Floating Action Button (New Chat) */}
            <div className="absolute bottom-24 right-6 z-20">
                <Form method="post">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isCreating}
                        className="w-14 h-14 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center shadow-lg shadow-neon-purple/30 text-white"
                    >
                        {isCreating ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        )}
                    </motion.button>
                </Form>
            </div>

            <BottomNav />
        </SafeArea>
    );
}
