import { useState, useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { hapticMedium } from "~/lib/haptic";

interface ChatInputProps {
    onSend: (message: string) => void;
    onImageSelect?: (file: File) => void;
    isLoading?: boolean;
    onTyping?: (isTyping: boolean) => void; // 타이핑 상태 전달 콜백 추가
}

export function ChatInput({ onSend, onImageSelect, isLoading = false, onTyping }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 타이핑 감지 타이머

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);

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
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        <div className="bg-[#f6f7f8] dark:bg-[#101c22] border-t border-gray-200 dark:border-gray-800 p-2 pb-4">
            <div className="flex items-end gap-2 p-2">
                {/* File Input (Hidden) */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Add Button */}
                <button
                    onClick={() => {
                        hapticMedium();
                        fileInputRef.current?.click();
                    }}
                    className="flex items-center justify-center w-10 h-10 text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-[#283339] rounded-full transition-colors shrink-0"
                >
                    <HugeiconsIcon icon={Add01Icon} className="text-2xl" />
                </button>

                {/* Input Area */}
                <div className="flex-1 bg-white dark:bg-[#283339] rounded-3xl flex items-center min-h-[44px] px-4 border border-gray-200 dark:border-transparent">
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Message..."
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-10 focus:ring-0 p-0"
                        disabled={isLoading}
                    />
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </button>
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={isLoading || !message.trim()}
                    className={cn(
                        "flex items-center justify-center w-10 h-10 bg-primary hover:bg-sky-600 rounded-full text-white shadow-md hover:shadow-lg transition-all shrink-0",
                        (isLoading || !message.trim()) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
