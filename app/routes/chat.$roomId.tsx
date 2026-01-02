import { useRef, useEffect, useState } from "react";
import { type LoaderFunctionArgs, type ActionFunctionArgs, useLoaderData, useFetcher, useNavigate, useRevalidator } from "react-router";
import { SafeArea, BottomNav } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { MessageBubble } from "~/components/chat/message-bubble";
import { ChatInput } from "~/components/chat/chat-input";
import { DateSeparator } from "~/components/chat/date-separator";
import { ScrollDownButton } from "~/components/chat/scroll-down-button";
import { TypingIndicator } from "~/components/chat/typing-indicator";
import { isSameDay } from "~/lib/date-utils";
import { usePusherChannel } from "~/hooks/use-pusher";
import { hapticLight, hapticSuccess } from "~/lib/haptic";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

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

    // 🔥 Optimistic Typing: 내가 메시지를 보내면 AI가 쓰고 있다고 가정
    const [isOptimisticTyping, setIsOptimisticTyping] = useState(false);

    // 🔥 AI인지 확인 (일반 채팅 격리)
    // 파트너 이름이나 이메일에 'ai' 또는 'concierge'가 포함되어 있는지 확인하여 더 유연하게 대응
    const isAiChat = partner?.email === "ai@staync.com" ||
        partner?.name?.toLowerCase().includes("ai") ||
        partner?.name?.toLowerCase().includes("concierge") ||
        room.name?.toLowerCase().includes("concierge");

    // Loader 데이터가 갱신되면 상태 동기화 (Pusher가 없어도 메시지 목록 최신화)
    useEffect(() => {
        setMessages(initialMessages);
        setIsOptimisticTyping(false); // 로더 갱신(새로고침 등) 되면 일단 끔
    }, [initialMessages]);

    // 스크롤 핸들러 (위치 감지) - flex column 이슈 해결을 위해 h-full 대신 flex-1 사용
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
            // 약간의 딜레이를 주어 렌더링 후 스크롤
            setTimeout(() => {
                scrollRef.current?.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: smooth ? "smooth" : "auto"
                });
            }, 50);
            setHasNewMessage(false);
        }
    };

    // 읽음 처리 함수
    const markAsRead = async () => {
        try {
            await fetch("/api/read", {
                method: "POST",
                body: new URLSearchParams({ roomId: room.id }),
            });
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    // 메시지가 갱신되거나 스크롤이 바닥일 때 읽음 처리
    useEffect(() => {
        if (isAtBottom && messages.length > 0) {
            markAsRead();
        }
        // 메시지가 추가되면(특히 AI 답변) 낙관적 타이핑 해제
        if (messages.length > initialMessages.length) {
            setIsOptimisticTyping(false);
        }
    }, [messages, isAtBottom, room.id]);

    // ✅ Real-time Hook 사용 (Clean & Professional)
    usePusherChannel(`room-${room.id}`, {
        "new-message": (data: any) => {
            setMessages((prev) => {
                // 중복 방지
                if (prev.find(m => m.id === data.id)) return prev;

                // AI 답변이 오면 낙관적 타이핑 해제
                if (data.senderId !== user.id) {
                    setIsOptimisticTyping(false);
                }

                setTypingUsers(prevSet => {
                    const newSet = new Set(prevSet);
                    newSet.delete(data.senderId);
                    return newSet;
                });

                // 새 메시지가 왔을 때 내가 보고 있다면 읽음 처리
                if (isAtBottom && document.visibilityState === "visible") {
                    markAsRead();
                }

                if (!isAtBottom) {
                    setHasNewMessage(true);
                    hapticSuccess(); // 📩 새 메시지 수신 진동
                    return [...prev, data];
                }
                hapticSuccess(); // 📩 새 메시지 수신 진동
                return [...prev, data];
            });
        },
        "user-typing": (data: { userId: string; isTyping: boolean }) => {
            if (String(data.userId) === String(user.id)) return;

            // 이미 낙관적 타이핑 중이면 서버 이벤트 무시 (깜빡임 방지)
            // 🔥 Fix: 서버에서 'isTyping: true'가 와도 낙관적 상태를 끄지 않습니다.
            // 낙관적 상태는 오직 "새 메시지 도착(답변 완료)" 또는 "타이핑 멈춤(false)" 신호에만 끕니다.
            if (!data.isTyping) {
                setIsOptimisticTyping(false);
            }

            setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (data.isTyping) {
                    newSet.add(data.userId);
                } else {
                    newSet.delete(data.userId);
                }
                return newSet;
            });

            if (isAtBottom && data.isTyping) {
                setTimeout(() => scrollToBottom(), 100);
            }
        },
        "read-receipt": (data: { userId: string; roomId: string }) => {
            // 상대방이 읽었음 -> 내 메시지들을 읽음 처리
            if (String(data.userId) !== String(user.id)) {
                setMessages(prev => prev.map(msg =>
                    msg.senderId === user.id && !msg.read ? { ...msg, read: true } : msg
                ));
            }
        }
    });

    // 메시지 추가 시 자동 스크롤 로직
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) return;

        if (lastMessage.senderId === user.id) {
            scrollToBottom();
            return;
        }

        if (isAtBottom) {
            scrollToBottom();
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

        // 🔥 전송 즉시 낙관적 타이핑 시작! (단, AI 채팅일 때만)
        if (isAiChat) {
            setIsOptimisticTyping(true);
        }

        // 전송 직후 스크롤 내리기 (낙관적 업데이트보다 빠르게 반응)
        setTimeout(() => scrollToBottom(), 50);
        hapticLight(); // 👆 전송 버튼 햅틱
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

            // 이미지도 보내면 AI가 본다고 가정 (AI 채팅일 때만)
            if (isAiChat) {
                setIsOptimisticTyping(true);
            }

            setTimeout(() => scrollToBottom(), 50);

        } catch (error) {
            console.error("Image upload/send error:", error);
            alert("이미지 전송에 실패했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    // 파트너이거나 타이핑 중인 유저가 있는 경우 (안전장치 포함)
    // 혹은 내가 방금 메시지를 보내서 낙관적 대기 상태인 경우
    const isPartnerTyping = isOptimisticTyping || (partner ? typingUsers.has(partner.id) : typingUsers.size > 0);

    return (
        <SafeArea className="bg-[#f6f7f8] dark:bg-[#101c22] flex flex-col h-[100dvh] max-h-[100dvh] relative overflow-hidden">
            {/* Header - Stitch Design */}
            <header className="flex items-center justify-between px-4 py-3 bg-[#f6f7f8] dark:bg-[#101c22] border-b border-gray-200 dark:border-gray-800 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/chat")}
                        className="flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
                    </button>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {partner?.image || partner?.avatarUrl ? (
                                <img
                                    src={partner.image || partner.avatarUrl}
                                    alt={partner.name || "User"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {(partner?.name || "U").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#101c22] rounded-full" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                            {partner?.name || room.name || "Unknown"}
                        </h2>
                        <span className="text-xs text-slate-500 dark:text-[#9db0b9]">Active now</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                        </svg>
                    </button>
                    <button className="flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-2 scroll-smooth"
            >
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 dark:text-[#9db0b9] text-sm py-10">
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
                                senderName={msg.sender.name || undefined}
                                senderImage={msg.sender.image || undefined}
                                type={msg.type as any}
                                isChain={isChain}
                                read={(msg as any).read}
                                isAi={isAiChat}
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
                        status="sending" // 전송 중 상태 표시
                        read={false}
                    />
                )}

                {/* ✨ Typing Indicator ✨ */}
                <TypingIndicator
                    isTyping={isPartnerTyping}
                    partnerName={partner?.name || "상대방"}
                    partnerImage={partner?.image || partner?.avatarUrl || undefined}
                />

                {/* Spacer for visibility behind sticky input */}
                <div className="h-4" />
            </main>

            <ScrollDownButton
                show={showScrollButton}
                onClick={() => scrollToBottom()}
                hasNewMessage={hasNewMessage}
            />

            <div className="relative z-30 bg-[#f6f7f8] dark:bg-[#101c22] pb-[calc(env(safe-area-inset-bottom)+76px)]">
                <ChatInput
                    onSend={handleSend}
                    onImageSelect={handleImageSelect}
                    isLoading={fetcher.state === "submitting" || isUploading}
                    onTyping={handleStreamingTyping}
                />
            </div>

            <BottomNav />
        </SafeArea>
    );
}
