import { useState, useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize logic
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // 한글 조합 중일 때 전송 방지
            if (e.nativeEvent.isComposing) return;
            handleSend();
        }
    };

    const handleSend = () => {
        if (!message.trim() || isLoading) return;
        onSend(message);
        setMessage("");
    };

    return (
        <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 pb-8"> {/* pb-8 for safe area */}
            <div className="flex items-end gap-3 max-w-3xl mx-auto">
                {/* Plus Button (For Attachments) */}
                <button className="p-2.5 rounded-full bg-white/5 text-white/60 hover:text-neon-blue hover:bg-neon-blue/10 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-7-7v14" />
                    </svg>
                </button>

                {/* Input Area */}
                <div className="flex-1 bg-white/5 rounded-[24px] border border-white/10 focus-within:border-neon-purple/50 focus-within:bg-white/10 transition-all overflow-hidden flex items-end">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="메시지를 입력하세요..."
                        className="w-full bg-transparent border-none text-white placeholder-white/30 px-5 py-3.5 focus:ring-0 max-h-[120px] resize-none scrollbar-hide font-light leading-relaxed"
                        rows={1}
                        disabled={isLoading}
                    />
                </div>

                {/* Send Button */}
                <AnimatePresence>
                    {(message.trim() || isLoading) && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={handleSend}
                            disabled={isLoading}
                            className={cn(
                                "p-3 rounded-full shadow-lg shadow-neon-purple/20 transition-all",
                                isLoading
                                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                                    : "bg-gradient-to-tr from-neon-purple to-indigo-500 text-white hover:brightness-110 active:scale-95"
                            )}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="translate-x-0.5 translate-y-px">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
