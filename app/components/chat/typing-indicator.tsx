import { motion } from "framer-motion";

export function TypingIndicator({ isTyping }: { isTyping: boolean }) {
    if (!isTyping) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-1 px-4 py-2 ml-4 mb-2 w-fit bg-white/10 rounded-2xl rounded-tl-none border border-white/5"
        >
            <span className="flex gap-1">
                <motion.span
                    className="w-1.5 h-1.5 bg-white/40 rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                    className="w-1.5 h-1.5 bg-white/40 rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                    className="w-1.5 h-1.5 bg-white/40 rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
            </span>
            <span className="text-[10px] text-white/30 ml-2">상대방이 입력 중...</span>
        </motion.div>
    );
}
