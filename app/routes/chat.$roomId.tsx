import { useRef, useEffect, useState } from "react";
import { type LoaderFunctionArgs, type ActionFunctionArgs, useLoaderData, useFetcher, useNavigate, useRevalidator } from "react-router";
import { SafeArea, AppHeader } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { MessageBubble } from "~/components/chat/message-bubble";
import { ChatInput } from "~/components/chat/chat-input";
import { DateSeparator } from "~/components/chat/date-separator";
import { ScrollDownButton } from "~/components/chat/scroll-down-button";
import { TypingIndicator } from "~/components/chat/typing-indicator";
import { isSameDay } from "~/lib/date-utils";
import { usePusherChannel } from "~/hooks/use-pusher";

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

    // 스크롤 상태 관리
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [isUploading, setIsUploading] = useState(false); // 업로드 상태

    // 타이핑 중인 사용자 목록
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const typingFetcher = useFetcher(); // 타이핑 전송용 별도 fetcher

    // Loader 데이터가 갱신되면 상태 동기화 (Pusher가 없어도 메시지 목록 최신화)
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // 스크롤 핸들러 (위치 감지)
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isBottom = scrollHeight - scrollTop - clientHeight < 100; // 오차범위 100px

        setIsAtBottom(isBottom);
        setShowScrollButton(!isBottom);

        // 바닥에 도달하면 새 메시지 알림 해제
        if (isBottom) {
            setHasNewMessage(false);
        }
    };

    const scrollToBottom = (smooth = true) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: smooth ? "smooth" : "auto"
            });
            setHasNewMessage(false);
        }
    };

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

                // 새 메시지가 오면 해당 유저의 타이핑 상태 제거
                setTypingUsers(prevSet => {
                    const newSet = new Set(prevSet);
                    newSet.delete(data.senderId);
                    return newSet;
                });

                // 새 메시지가 왔는데 스크롤이 위에 있다면 알림 표시
                if (!isAtBottom) {
                    setHasNewMessage(true);
                    return [...prev, data];
                }
                // 바닥이면 그냥 추가 (자동 스크롤은 useEffect에서 처리)
                return [...prev, data];
            });
        },
        "user-typing": (data: { userId: string; isTyping: boolean }) => {
            // 내가 보낸 건 무시
            if (data.userId === user.id) return;

            setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (data.isTyping) {
                    newSet.add(data.userId);
                } else {
                    newSet.delete(data.userId);
                }
                return newSet;
            });

            // ... (스크롤 로직 등)

            // 타이핑 시작 시 바닥에 있다면 스크롤 살짝 조정
            if (isAtBottom && data.isTyping) {
                setTimeout(() => scrollToBottom(), 100);
            }
        }
    });

    // 메시지 추가 시 자동 스크롤 로직
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return;

        // 1. 내가 보낸 메시지인 경우 -> 무조건 스크롤
        if (lastMessage.senderId === user.id) {
            scrollToBottom();
            return;
        }

        // 2. 남이 보낸 메시지
        if (isAtBottom) {
            scrollToBottom();
        } else {
            // 보고 있는 위치 유지 (아무것도 안 함)
            // 대신 위지 감지 로직에서 setHasNewMessage(true) 처리됨
        }
    }, [messages, user.id, isAtBottom]);

    // 페이지 최초 진입 시 스크롤 바닥으로
    useEffect(() => {
        scrollToBottom(false);
    }, []);

    const handleSend = (text: string) => {
        const formData = new FormData();
        formData.append("content", text);
        formData.append("roomId", room.id); // API에 roomId 전달 필수
        fetcher.submit(formData, { method: "post", action: "/api/messages" });
        // 전송 직후 스크롤 내리기 (낙관적 업데이트보다 빠르게 반응)
        setTimeout(() => scrollToBottom(), 50);
    };

    // 타이핑 이벤트 전송 (api.typing.ts 호출)
    const handleStreamingTyping = (isTyping: boolean) => {
        const formData = new FormData();
        formData.append("roomId", room.id);
        formData.append("isTyping", isTyping.toString());
        // 메인 fetcher와 분리된 typingFetcher 사용
        typingFetcher.submit(formData, { method: "post", action: "/api/typing" });
    };

    const handleImageSelect = async (file: File) => {
        if (!file) return;
        setIsUploading(true);

        try {
            // 1. Cloudinary 업로드
            const uploadData = new FormData();
            uploadData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: uploadData
            });

            if (!response.ok) throw new Error("Upload failed");

            const { url } = await response.json();

            // 2. 메시지 전송 (type=IMAGE, content=URL)
            // fetcher.submit은 multipart/form-data를 기본으로 처리하므로 
            // type 필드를 추가해서 보냅니다.
            const formData = new FormData();
            formData.append("content", url);
            formData.append("roomId", room.id);
            formData.append("type", "IMAGE"); // 이미지 타입 명시

            fetcher.submit(formData, { method: "post", action: "/api/messages" });
            setTimeout(() => scrollToBottom(), 50);

        } catch (error) {
            console.error("Image upload/send error:", error);
            alert("이미지 전송에 실패했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    const isPartnerTyping = partner ? typingUsers.has(partner.id) : typingUsers.size > 0;

    return (
        <SafeArea className="bg-background flex flex-col h-full pt-20 relative">
            <AppHeader
                title={partner?.name || room.name || "Unknown"}
                showBack={true}
                onBack={() => navigate("/chat")}
            />

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
            >
                {messages.length === 0 && (
                    <div className="text-center text-white/30 text-sm py-10">
                        대화가 없습니다.
                    </div>
                )}

                {messages.map((msg, index) => {
                    const prevMsg = messages[index - 1];
                    const showDateSeparator = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);
                    // 연속된 메시지인지 판단 (보낸사람 같음 + 날짜구분선 없음)
                    const isChain = !!prevMsg && prevMsg.senderId === msg.senderId && !showDateSeparator;

                    return (
                        <div key={msg.id}>
                            {showDateSeparator && (
                                <DateSeparator date={msg.createdAt} />
                            )}
                            <MessageBubble
                                content={msg.content}
                                isMe={msg.senderId === user.id}
                                createdAt={msg.createdAt}
                                senderName={msg.sender.name}
                                senderImage={msg.sender.image || undefined}
                                type={msg.type as any}
                                isChain={isChain}
                            />
                        </div>
                    );
                })}

                {/* Optimistic UI (Text Only for now) */}
                {fetcher.state === "submitting" && !fetcher.formData?.get("type") && fetcher.formData?.get("content") && (
                    <MessageBubble
                        content={fetcher.formData.get("content") as string}
                        isMe={true}
                        createdAt={new Date()}
                        senderName={user.name}
                        senderImage={user.image || undefined}
                    />
                )}

                {/* ✨ Typing Indicator ✨ */}
                <TypingIndicator isTyping={isPartnerTyping} />
            </div>

            <ScrollDownButton
                show={showScrollButton}
                onClick={() => scrollToBottom()}
                hasNewMessage={hasNewMessage}
            />

            <ChatInput
                onSend={handleSend}
                onImageSelect={handleImageSelect}
                isLoading={fetcher.state === "submitting" || isUploading}
                onTyping={handleStreamingTyping}
            />
        </SafeArea>
    );
}
