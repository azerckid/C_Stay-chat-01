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
    isChain?: boolean; // 연속된 메시지 여부 (true면 프로필/시간 생략 등)
}

export function MessageBubble({
    content,
    isMe,
    createdAt,
    senderName,
    senderImage,
    type = "TEXT",
    isChain = false
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex w-full gap-3",
                isMe ? "justify-end" : "justify-start",
                isChain ? "mb-1" : "mb-4 mt-2" // 연속되면 간격 좁게, 아니면 넓게
            )}
        >
            {/* 상대방 프로필 (내가 아님 AND 연속된 메시지가 아닐 때만 표시) */}
            {!isMe && (
                <div className="shrink-0 flex flex-col items-center w-8">
                    {!isChain ? (
                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                            {senderImage ? (
                                <img src={senderImage} alt={senderName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-white/50 font-bold">
                                    {senderName?.charAt(0)}
                                </div>
                            )}
                        </div>
                    ) : (
                        // 자리 차지만 함 (들여쓰기 유지)
                        <div className="w-8" />
                    )}
                </div>
            )}

            <div className={cn("flex flex-col max-w-[70%]", isMe && "items-end")}>
                {/* 이름 (상대방 AND 첫 메시지일 때만) */}
                {!isMe && !isChain && (
                    <span className="text-[10px] text-muted-foreground ml-1 mb-1">
                        {senderName}
                    </span>
                )}

                <div className="flex items-end gap-2">
                    {/* 내 메시지 시간 (왼쪽) */}
                    {isMe && (
                        <span className={cn("text-[10px] text-white/30 mb-1 min-w-[40px] text-right", isChain && "opacity-0 group-hover:opacity-100 transition-opacity")}>
                            {timeString}
                        </span>
                    )}

                    {/* 말풍선 본문 (링크 적용) */}
                    <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed break-words shadow-sm",
                        isMe
                            ? "bg-gradient-to-br from-neon-purple to-indigo-600 text-white"
                            : "bg-white/10 text-white/90 border border-white/5",
                        // 말풍선 꼬리 처리
                        isMe && !isChain && "rounded-tr-none", // 내 첫 메시지
                        !isMe && !isChain && "rounded-tl-none", // 상대 첫 메시지
                        isChain && "rounded-2xl" // 연속 메시지는 둥글게
                    )}>
                        {linkify(content)}
                    </div>

                    {/* 상대방 메시지 시간 (오른쪽) */}
                    {!isMe && (
                        <span className={cn("text-[10px] text-white/30 mb-1 min-w-[40px] text-left", isChain && "opacity-0 group-hover:opacity-100 transition-opacity")}>
                            {timeString}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
