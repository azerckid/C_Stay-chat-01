import { motion } from "framer-motion";
import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { formatMessageTime } from "~/lib/date-utils";

interface ChatListItemProps {
    id: string; // Room ID
    title: string;
    lastMessage: string;
    updatedAt: string | Date;
    image?: string;
    unreadCount?: number;
    isActive?: boolean; // 현재 선택된 방인지
    isOnline?: boolean; // 온라인 상태 (선택적)
}

export function ChatListItem({
    id,
    title,
    lastMessage,
    updatedAt,
    image,
    unreadCount = 0,
    isActive = false,
    isOnline = false,
}: ChatListItemProps) {
    // 시간 포맷팅 (예: 10:42 AM)
    const timeStr = formatMessageTime(updatedAt);

    return (
        <Link to={`/chat/${id}`} className="block w-full">
            <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "group relative flex items-center p-3 rounded-2xl transition-all duration-200 cursor-pointer",
                    "bg-card hover:bg-white dark:hover:bg-muted shadow-sm",
                    "border border-transparent hover:border-border"
                )}
            >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {image ? (
                        <img
                            alt={title}
                            className="h-12 w-12 rounded-full object-cover"
                            src={image}
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-bold text-foreground">
                                {title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    {/* Online Status */}
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                    )}
                </div>

                {/* Content */}
                <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-bold text-foreground truncate">
                            {title}
                        </p>
                        <p className={cn(
                            "text-xs shrink-0 ml-2",
                            unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                            {timeStr}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                            {lastMessage}
                        </p>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 ml-2 text-xs font-bold leading-none text-white bg-primary rounded-full">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
