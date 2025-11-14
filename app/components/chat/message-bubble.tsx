import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { formatMessageTime } from "~/lib/date-utils";
import { linkify } from "~/lib/text-utils";

interface MessageBubbleProps {
    content: string;
    isMe: boolean;
    createdAt: string | Date;
    senderName?: string;
    senderImage?: string;
    type?: "TEXT" | "IMAGE" | "SYSTEM";
    isChain?: boolean;
    status?: "sending" | "sent" | "error"; // 전송 상태 추가
    onRetry?: () => void; // 재전송 핸들러
}

export function MessageBubble({
    content,
    isMe,
    createdAt,
    senderName,
    senderImage,
    type = "TEXT",
    isChain = false,
    status = "sent",
    onRetry
}: MessageBubbleProps) {
    // 시스템 메시지
    if (type === "SYSTEM") {
        return (
            <div className="flex justify-center my-4">
                <span className="px-3 py-1 text-xs font-medium text-white/40 bg-white/5 rounded-full">
                    {content}
                </span>
            </div>
        );
    }

    const timeString = formatMessageTime(createdAt);

    // 이미지 URL인지 확인하는 정규식 (Cloudinary URL 등 포함)
    const isImageUrl = (text: string) => {
        return /\.(jpeg|jpg|gif|png|webp)$/i.test(text) || text.includes("/image/upload/");
    };

    const showAsImage = type === "IMAGE" || (type === "TEXT" && isImageUrl(content));

    // 아바타 렌더링 (공통)
    const avatarElement = (
        <div className="shrink-0 flex flex-col items-center w-8">
            {!isChain ? (
                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden border border-white/5">
                    {senderImage ? (
                        <img src={senderImage} alt={senderName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-white/50 font-bold uppercase">
                            {senderName?.charAt(0)}
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-8" />
            )}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex w-full gap-3",
                isMe ? "justify-end" : "justify-start",
                isChain ? "mb-1" : "mb-4 mt-2"
            )}
        >
            {/* 상대방 아바타 (왼쪽) */}
            {!isMe && avatarElement}

            <div className={cn("flex flex-col max-w-[70%]", isMe && "items-end")}>
                {/* 이름 표시 (첫 메시지일 때만) */}
                {!isChain && (
                    <span className={cn(
                        "text-[10px] text-muted-foreground mb-1",
                        isMe ? "mr-1 text-right" : "ml-1 text-left"
                    )}>
                        {senderName}
                    </span>
                )}

                <div className="flex items-end gap-2">
                    {/* 내 시간 및 상태 (왼쪽) */}
                    {isMe && (
                        <div className="flex flex-col items-end min-w-[40px] mb-1">
                            {status === "error" ? (
                                <button onClick={onRetry} className="text-red-500 hover:text-red-400 transition-colors" title="재전송">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                                </button>
                            ) : (
                                <span className={cn("text-[10px] text-white/30 text-right", isChain && "opacity-0 group-hover:opacity-100 transition-opacity")}>
                                    {timeString}
                                </span>
                            )}
                        </div>
                    )}

                    {/* 말풍선 본문 */}
                    <div className={cn(
                        "relative transition-opacity duration-300",
                        status === "sending" && "opacity-50"
                    )}>
                        {showAsImage ? (
                            <div className={cn(
                                "rounded-2xl overflow-hidden shadow-sm border border-white/10",
                                isMe ? "rounded-tr-none" : "rounded-tl-none"
                            )}>
                                <img
                                    src={content}
                                    alt="Shared Image"
                                    className="max-w-full h-auto object-cover max-h-[300px]"
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            <div className={cn(
                                "px-4 py-3 rounded-2xl text-sm leading-relaxed break-words shadow-sm",
                                isMe
                                    ? "bg-gradient-to-br from-neon-purple to-indigo-600 text-white"
                                    : "bg-white/10 text-white/90 border border-white/5",
                                isMe && !isChain && "rounded-tr-none",
                                !isMe && !isChain && "rounded-tl-none",
                                isChain && "rounded-2xl",
                                status === "error" && "border-red-500/50 bg-red-500/10"
                            )}>
                                {linkify(content)}
                            </div>
                        )}
                    </div>

                    {/* 상대방 시간 (오른쪽) */}
                    {!isMe && (
                        <span className={cn("text-[10px] text-white/30 mb-1 min-w-[40px] text-left", isChain && "opacity-0 group-hover:opacity-100 transition-opacity")}>
                            {timeString}
                        </span>
                    )}
                </div>
            </div>

            {/* 내 아바타 (오른쪽) */}
            {isMe && avatarElement}
        </motion.div>
    );
}
