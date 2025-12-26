import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface TypingIndicatorProps {
    isTyping: boolean;
    partnerName?: string;
    partnerImage?: string;
}

export function TypingIndicator({ isTyping, partnerName = "AI Concierge", partnerImage }: TypingIndicatorProps) {
    if (!isTyping) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-end gap-2 mb-4"
        >
            {/* AI Avatar */}
            <Avatar className="w-8 h-8 border border-white/10 shadow-sm">
                <AvatarImage src={partnerImage || "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"} />
                <AvatarFallback>AI</AvatarFallback>
            </Avatar>

            {/* Bubble */}
            <div className="flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground ml-1">{partnerName}</span>
                <div className="bg-muted/50 border border-border/40 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 w-fit shadow-sm backdrop-blur-sm">
                    <span className="text-xs text-muted-foreground mr-1 hidden sm:inline-block">답변 작성 중</span>
                    <motion.div
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                        animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                        animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                        animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
