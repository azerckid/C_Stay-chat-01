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


    // ✅ 스트리밍 중인 메시지들을 임시로 담아두는 상태
    const [streamingMessages, setStreamingMessages] = useState<Record<string, any>>({});

    // ✅ Real-time Hook 사용 (Clean & Professional)
    usePusherChannel(`room-${room.id}`, {
        "new-message": (data: any) => {
            // 스트리밍 후 실제 메시지가 오면 스트리밍 상태 제거
            if (data.streamingId) {
                setStreamingMessages(prev => {
                    const next = { ...prev };
                    delete next[data.streamingId];
                    return next;
                });
            }

            setMessages((prev) => {
                // 1. ID 기반 중복 방지 (기본)
                if (prev.find(m => m.id === data.id)) return prev;

                // 2. [핵심] 낙관적 업데이트 중복 방지:
                // 내가 보낸 메시지인데 내용이 동일한 경우 무시
                const isMyMessage = data.senderId === user.id;
                if (isMyMessage) {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.content === data.content) {
                        return prev;
                    }
                }

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

                hapticSuccess(); // 📩 새 메시지 수신 진동
                return [...prev, data];
            });
        },
        "ai-streaming": (data: any) => {
            // 스트리밍 데이터 수신
            setStreamingMessages(prev => ({
                ...prev,
                [data.id]: {
                    ...data,
                    createdAt: new Date().toISOString(),
                    type: "TEXT"
                }
            }));

            // 스트리밍 중일 때 바닥이면 계속 스크롤 유지
            if (isAtBottom) {
                setTimeout(() => scrollToBottom(), 50);
            }
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

    const handleSend = async (text: string) => {
        const formData = new FormData();
        formData.append("content", text);
        formData.append("roomId", room.id);

        hapticLight(); // 👆 전송 버튼 햅틱
        setTimeout(() => scrollToBottom(), 50);

        if (isAiChat) {
            setIsOptimisticTyping(true);
            try {
                const response = await fetch("/api/messages", {
                    method: "post",
                    body: formData,
                });

                if (!response.ok) throw new Error("Send failed");

                // SSE 스트림 읽기 시작
                const reader = response.body?.getReader();
                if (!reader) return;

                const decoder = new TextDecoder();
                let buffer = "";
                let currentStreamingId = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine.startsWith("data: ")) continue;

                        try {
                            const data = JSON.parse(trimmedLine.substring(6));

                            if (data.id) {
                                currentStreamingId = data.id;
                            }

                            if (data.done) {
                                setIsOptimisticTyping(false);
                                // 실제 메시지로 전환될 때까지 약간 대기하거나 revalidator 사용
                                setTimeout(() => revalidator.revalidate(), 500);
                            } else if (data.content && currentStreamingId) {
                                setStreamingMessages(prev => {
                                    const existing = prev[currentStreamingId];
                                    return {
                                        ...prev,
                                        [currentStreamingId]: {
                                            id: currentStreamingId,
                                            content: (existing?.content || "") + data.content,
                                            senderId: data.senderId || existing?.senderId,
                                            sender: data.sender || existing?.sender,
                                            createdAt: existing?.createdAt || new Date().toISOString()
                                        }
                                    };
                                });
                                // 타이핑 상태 해제 (응답이 오기 시작했으므로)
                                setIsOptimisticTyping(false);
                            }
                        } catch (e) {
                            console.error("Parse Error:", e);
                        }
                    }
                }
            } catch (error) {
                console.error("AI Send Error:", error);
                setIsOptimisticTyping(false);
            }
        } else {
            // 일반 채팅은 기존처럼 fetcher.submit 사용
            fetcher.submit(formData, { method: "post", action: "/api/messages" });
        }
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
                                    src={partner.image ?? partner.avatarUrl ?? undefined}
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

                {/* Existing Messages */}
                {messages.map((msg, index) => {
                    const prevMsg = messages[index - 1];
                    const showDateSeparator = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);

                    // '---' 구분자로 메시지 분할 처리 (공백/줄바꿈/탭 등 모든 공백 유연하게)
                    const parts = msg.content.split(/\s*---\s*/).map(p => p.trim()).filter(p => p !== "");

                    return (
                        <div key={msg.id}>
                            {showDateSeparator && (
                                <DateSeparator date={msg.createdAt} />
                            )}
                            {parts.map((part, pIndex) => {
                                // 이전 메시지 혹은 같은 뭉치 내 2번째부터는 체인 처리 (아바타 숨김)
                                const isChain = (!!prevMsg && prevMsg.senderId === msg.senderId && !showDateSeparator && pIndex === 0) || pIndex > 0;

                                return (
                                    <MessageBubble
                                        key={`${msg.id}-${pIndex}`}
                                        content={part}
                                        isMe={msg.senderId === user.id}
                                        createdAt={msg.createdAt}
                                        senderName={msg.sender?.name || undefined}
                                        senderImage={msg.sender?.image || msg.sender?.avatarUrl || undefined}
                                        type={msg.type as any}
                                        isChain={isChain}
                                        read={(msg as any).read}
                                        isAi={isAiChat}
                                    />
                                );
                            })}
                        </div>
                    );
                })}

                {/* ✨ Streaming Messages (Split support) ✨ */}
                {Object.values(streamingMessages).map((streamMsg) => {
                    // 스트리밍 중에도 실시간으로 분할하여 여러 말풍선 생성 (모든 공백 유연하게 인식)
                    const parts = streamMsg.content.split(/\s*---\s*/).map((p: string) => p.trim()).filter((p: string) => p !== "");

                    return (
                        <div key={streamMsg.id}>
                            {parts.map((part: string, pIndex: number) => (
                                <MessageBubble
                                    key={`${streamMsg.id}-${pIndex}`}
                                    content={part}
                                    isMe={false}
                                    createdAt={streamMsg.createdAt}
                                    senderName={streamMsg.sender?.name}
                                    senderImage={streamMsg.sender?.image}
                                    type="TEXT"
                                    status="sending"
                                    isAi={isAiChat}
                                    isChain={pIndex > 0} // 첫 번째 말풍선 이후로는 아바타 생략하여 깔끔하게 표시
                                />
                            ))}
                        </div>
                    );
                })}
                {/* 🛡️ 낙관적 업데이트 중복 방지: fetcher가 전송 중이더라도 이미 Pusher로 메시지를 받았다면 그리지 않음 */}
                {fetcher.state === "submitting" &&
                    !fetcher.formData?.get("type") &&
                    fetcher.formData?.get("content") &&
                    messages[messages.length - 1]?.content !== fetcher.formData.get("content") && (
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
