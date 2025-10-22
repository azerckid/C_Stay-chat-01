import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface MessageBubbleProps {
    content: string;
    isMe: boolean;
    createdAt: string | Date;
    senderName?: string;
    senderImage?: string;
    type?: "TEXT" | "IMAGE" | "SYSTEM";
}

export function MessageBubble({
    content,
    isMe,
    createdAt,
    senderName,
    senderImage,
    type = "TEXT"
}: MessageBubbleProps) {
    // 시스템 메시지는 중앙 정렬
    if (type === "SYSTEM") {
        return (
            <div className="flex justify-center my-4">
                <span className="px-3 py-1 text-xs font-medium text-white/40 bg-white/5 rounded-full">
                    {content}
                </span>
            </div>
        );
    }

    const timeString = format(new Date(createdAt), "a h:mm", { locale: ko });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
                "flex w-full mb-4 gap-3",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            {/* 상대방 프로필 (내가 아닐 때만) */}
            {!isMe && (
                <div className="shrink-0 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden mb-1">
                        {senderImage ? (
                            <img src={senderImage} alt={senderName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-white/50 font-bold">
                                {senderName?.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={cn("flex flex-col max-w-[70%]", isMe && "items-end")}>
                {/* 이름 (상대방일 때만 표시, 일단은 생략 가능하지만 넣음) */}
                {!isMe && (
                    <span className="text-[10px] text-muted-foreground ml-1 mb-1">
                        {senderName}
                    </span>
                )}

                <div className="flex items-end gap-2">
                    {/* 내 메시지 시간 (왼쪽) */}
                    {isMe && (
                        <span className="text-[10px] text-white/30 mb-1">
                            {timeString}
                        </span>
                    )}

                    {/* 말풍선 본문 */}
                    <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed break-words shadow-sm",
                        isMe
                            ? "bg-gradient-to-br from-neon-purple to-indigo-600 text-white rounded-tr-none"
                            : "bg-white/10 text-white/90 rounded-tl-none border border-white/5"
                    )}>
                        {content}
                    </div>

                    {/* 상대방 메시지 시간 (오른쪽) */}
                    {!isMe && (
                        <span className="text-[10px] text-white/30 mb-1">
                            {timeString}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
