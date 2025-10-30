import { motion, AnimatePresence } from "framer-motion";

interface ScrollDownButtonProps {
    show: boolean;
    onClick: () => void;
    hasNewMessage?: boolean;
}

export function ScrollDownButton({ show, onClick, hasNewMessage = false }: ScrollDownButtonProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={onClick}
                    className="absolute bottom-24 right-4 z-20 flex flex-col items-end gap-2"
                >
                    {hasNewMessage && (
                        <div className="bg-neon-blue text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                            새 메시지 ↓
                        </div>
                    )}
                    <div className="bg-gray-800/80 backdrop-blur text-white p-2.5 rounded-full shadow-md border border-white/10 hover:bg-gray-700 transition-colors">
                        <svg
                            width="20" height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                    </div>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
