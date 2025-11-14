import { useState, useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
    onSend: (message: string) => void;
    onImageSelect?: (file: File) => void;
    isLoading?: boolean;
    onTyping?: (isTyping: boolean) => void; // 타이핑 상태 전달 콜백 추가
}

export function ChatInput({ onSend, onImageSelect, isLoading = false, onTyping }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 타이핑 감지 타이머

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = `${newHeight}px`;
    };

    // Auto-resize logic (initial adjustment)
    useEffect(() => {
        adjustHeight();
    }, []); // Run once on mount

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        adjustHeight();

        // 타이핑 감지 로직
        if (onTyping) {
            // 이미 타이머가 돌고 있다면 취소 (아직 계속 치는 중이라는 뜻)
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            } else {
                // 타이머가 없었다면 -> '방금 타이핑 시작함' 이벤트 발송
                onTyping(true);
            }

            // 2초 동안 입력 없으면 -> '타이핑 멈춤' 이벤트 발송
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
                typingTimeoutRef.current = null;
            }, 2000);
        }
    };

    const handleSend = () => {
        if (!message.trim() || isLoading) return;
        onSend(message);
        setMessage("");

        // 전송 시 즉시 타이핑 멈춤 처리
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
            if (onTyping) onTyping(false);
        }

        // 높이 초기화
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // 한글 조합 중일 때 전송 방지
            if (e.nativeEvent.isComposing) return;
            handleSend();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImageSelect) {
            onImageSelect(file);
        }
        // 초기화 (같은 파일 다시 선택 가능하게)
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 pb-8"> {/* pb-8 for safe area */}
            <div className="flex items-end gap-3 max-w-3xl mx-auto">
                {/* File Input (Hidden) */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Plus Button (For Attachments) */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-full bg-white/5 text-white/60 hover:text-neon-blue hover:bg-neon-blue/10 transition-colors"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-7-7v14" />
                    </svg>
                </button>

                {/* Input Area */}
                <div className="flex-1 bg-white/5 rounded-[24px] border border-white/10 focus-within:border-neon-purple/50 focus-within:bg-white/10 transition-all overflow-hidden flex items-end">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
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
