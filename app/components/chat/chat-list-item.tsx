import { motion } from "framer-motion";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ChatListItemProps {
    id: string; // Room ID
    title: string;
    lastMessage: string;
    updatedAt: string | Date;
    image?: string;
    unreadCount?: number;
    isActive?: boolean; // 현재 선택된 방인지
}

export function ChatListItem({
    id,
    title,
    lastMessage,
    updatedAt,
    image,
    unreadCount = 0,
    isActive = false,
}: ChatListItemProps) {
    // 날짜 포맷팅 (예: '방금 전', '1시간 전')
    const timeAgo = formatDistanceToNow(new Date(updatedAt), {
        addSuffix: true,
        locale: ko,
    });

    return (
        <Link to={`/chat/${id}`} className="block w-full">
            <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border border-transparent",
                    isActive
                        ? "bg-white/10 border-white/10 shadow-lg shadow-black/20"
                        : "hover:bg-white/5 active:bg-white/10"
                )}
            >
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neon-purple to-neon-blue p-[2px]">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                            {image ? (
                                <img src={image} alt={title} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg font-bold text-white/80">
                                    {title.charAt(0)}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Online Status (임시) */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-black" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <h3 className={cn(
                            "font-semibold truncate",
                            isActive ? "text-neon-blue" : "text-white"
                        )}>
                            {title}
                        </h3>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {timeAgo}
                        </span>
                    </div>
                    <p className={cn(
                        "text-sm truncate",
                        isActive ? "text-white/90" : "text-muted-foreground"
                    )}>
                        {lastMessage}
                    </p>
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <div className="shrink-0">
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-neon-purple text-[10px] font-bold text-white shadow-lg shadow-neon-purple/40">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    </div>
                )}
            </motion.div>
        </Link>
    );
}
