import { useRef, useEffect, useState, useCallback } from "react";
import { type LoaderFunctionArgs, type ActionFunctionArgs, useLoaderData, useFetcher, useNavigate, useRevalidator } from "react-router";
import { SafeArea, AppHeader } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { MessageBubble } from "~/components/chat/message-bubble";
import { ChatInput } from "~/components/chat/chat-input";
import { usePusherChannel } from "~/hooks/use-pusher"; // Custom Hook Import

export async function loader({ request, params }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);
    const { roomId } = params;

    if (!roomId) throw new Error("Room ID Required");

    // 방 정보 및 메시지 조회
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            members: {
                include: { user: true }
            },
            messages: {
                orderBy: { createdAt: "asc" }, // 과거 -> 최신 순
                include: { sender: true }
            }
        }
    });

    if (!room) throw new Response("Room Not Found", { status: 404 });

    const isMember = room.members.some(m => m.userId === user.id);
    if (!isMember) throw new Response("Unauthorized", { status: 403 });

    const partner = room.members.find(m => m.userId !== user.id)?.user;

    return {
        user,
        room,
        partner,
        initialMessages: room.messages.map(msg => ({
            ...msg,
            createdAt: msg.createdAt.toISOString()
        }))
    };
}



export default function ChatRoomPage() {
    const { user, room, partner, initialMessages } = useLoaderData<typeof loader>();
    const [messages, setMessages] = useState(initialMessages);
    const fetcher = useFetcher();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const revalidator = useRevalidator(); // 데이터 갱신용

    // Loader 데이터가 갱신되면 상태 동기화 (Pusher가 없어도 메시지 목록 최신화)
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // ✅ Polling (Pusher 고장 시 대비용 - 3초마다 갱신)
    useEffect(() => {
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") {
                revalidator.revalidate();
            }
        }, 3000);
        return () => clearInterval(timer);
    }, [revalidator]);

    // ✅ Real-time Hook 사용 (Clean & Professional)
    // 이벤트 핸들러를 useCallback으로 감싸지 않아도 동작하지만,
    // 훅 내부 구현(의존성 배열)에 따라 성능 최적화가 필요할 수 있음.
    // 여기서는 usePusherChannel이 channelName 변경 시에만 재구독하므로 안전함.
    usePusherChannel(`room-${room.id}`, {
        "new-message": (data: any) => {
            setMessages((prev) => {
                // 중복 방지 (이미 Optimistic으로 추가된 경우 등)
                // 만약 ID가 같다면 덮어쓰거나 무시
                if (prev.find(m => m.id === data.id)) return prev;
                return [...prev, data];
            });
        }
    });

    // 스크롤 동기화
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        }
    }, [messages, fetcher.state]); // 메시지가 추가되거나 전송 상태가 바뀔 때 스크롤

    const handleSend = (text: string) => {
        const formData = new FormData();
        formData.append("content", text);
        formData.append("roomId", room.id); // API에 roomId 전달 필수
        fetcher.submit(formData, { method: "post", action: "/api/messages" });
    };

    return (
        <SafeArea className="bg-background flex flex-col h-full pt-20">
            <AppHeader
                title={partner?.name || room.name || "Unknown"}
                showBack={true}
                onBack={() => navigate("/chat")}
            />

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
            >
                {messages.length === 0 && (
                    <div className="text-center text-white/30 text-sm py-10">
                        대화가 없습니다.
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        content={msg.content}
                        isMe={msg.senderId === user.id}
                        createdAt={msg.createdAt}
                        senderName={msg.sender.name}
                        senderImage={msg.sender.image || undefined}
                        type={msg.type as any}
                    />
                ))}

                {/* Optimistic UI */}
                {fetcher.state === "submitting" && fetcher.formData && (
                    <MessageBubble
                        content={fetcher.formData.get("content") as string}
                        isMe={true}
                        createdAt={new Date()}
                        senderName={user.name}
                        senderImage={user.image || undefined}
                    />
                )}
            </div>

            <ChatInput
                onSend={handleSend}
                isLoading={fetcher.state === "submitting"}
            />
        </SafeArea>
    );
}
