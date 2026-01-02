import { cn } from "~/lib/utils";
import { formatMessageTime } from "~/lib/date-utils";
import { linkify } from "~/lib/text-utils";
import { TimelineView } from "./timeline-view";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    CheckmarkCircle02Icon,
    Tick02Icon,
    Rotate01Icon,
    Copy01Icon,
    Share01Icon,
    AiChat01Icon
} from "@hugeicons/core-free-icons";

interface MessageBubbleProps {
    content: string;
    isMe: boolean;
    createdAt: string | Date;
    senderName?: string;
    senderImage?: string;
    type?: "TEXT" | "IMAGE" | "SYSTEM";
    isChain?: boolean;
    status?: "sending" | "sent" | "error";
    read?: boolean;
    onRetry?: () => void;
    isAi?: boolean;
    onRegenerate?: () => void;
    onCopy?: () => void;
    onShare?: () => void;
}

export function MessageBubble({
    content,
    isMe,
    createdAt,
    senderName,
    senderImage,
    type = "TEXT",
    isChain = false,
    status = "sent",
    read = true,
    onRetry,
    isAi = false,
    onRegenerate,
    onCopy,
    onShare
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

    // 이미지 URL인지 확인하는 정규식
    const isImageUrl = (text: string) => {
        return /\.(jpeg|jpg|gif|png|webp)$/i.test(text) || text.includes("/image/upload/");
    };

    const showAsImage = type === "IMAGE" || (type === "TEXT" && isImageUrl(content));

    // 여행 계획 JSON 파싱 (안전하게)
    let travelPlan = null;
    if (type === "TEXT" && content.includes("```json") && content.includes("itinerary")) {
        try {
            // 마크다운 코드 블록 제거 후 파싱
            const jsonStr = content.match(/```json\n([\s\S]*?)\n```/)?.[1] || "";
            travelPlan = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse travel plan JSON", e);
        }
    }

    // 아바타 렌더링 (공통)
    const avatarElement = (
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0">
            {senderImage ? (
                <img src={senderImage} alt={senderName} className="w-full h-full rounded-full object-cover" loading="lazy" />
            ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-[10px] text-white font-bold uppercase bg-gradient-to-br from-indigo-500 to-purple-600">
                    {senderName?.charAt(0)}
                </div>
            )}
        </div>
    );

    return (
        <div
            className={cn(
                "flex w-full gap-3",
                isMe ? "justify-end" : "justify-start",
                isChain ? "mb-1" : "mb-4"
            )}
        >
            {/* 상대방 아바타 (왼쪽) */}
            {!isMe && avatarElement}

            <div className={cn("flex flex-col max-w-[75%]", isMe ? "items-end" : "items-start")}>
                <div className={cn("flex flex-col", isMe ? "items-end gap-1" : "items-start gap-1")}>
                    {/* 말풍선 본문 */}
                    <div className={cn(
                        "relative transition-opacity duration-300",
                        status === "sending" && "opacity-50"
                    )}>
                        {showAsImage ? (
                            <div className={cn(
                                "rounded-2xl overflow-hidden shadow-sm border border-white/10",
                                isMe && !isChain && "rounded-br-sm",
                                !isMe && !isChain && "rounded-bl-sm"
                            )}>
                                <img
                                    src={content}
                                    alt="Shared Image"
                                    className="max-w-full h-auto object-cover max-h-[300px]"
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            travelPlan ? (
                                <TimelineView plan={travelPlan} />
                            ) : (
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl text-[15px] font-normal leading-relaxed break-words shadow-sm dark:shadow-none",
                                    isMe
                                        ? "bg-primary text-white"
                                        : "bg-white dark:bg-[#283339] text-slate-800 dark:text-white",
                                    isMe && !isChain && "rounded-br-sm",
                                    !isMe && !isChain && "rounded-bl-sm",
                                    isChain && "rounded-2xl",
                                    status === "error" && "border-red-500/50 bg-red-500/10"
                                )}>
                                    {linkify(content)}
                                </div>
                            )
                        )}
                    </div>

                    {/* 시간 및 읽음 상태 */}
                    {isMe ? (
                        <div className="flex items-center gap-1 mr-1">
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                {timeString}
                            </span>
                            {status === "sent" && (
                                <HugeiconsIcon
                                    icon={read ? CheckmarkCircle02Icon : Tick02Icon}
                                    className={cn(
                                        "w-[14px] h-[14px]",
                                        read ? "text-primary" : "text-slate-500 dark:text-slate-600"
                                    )}
                                />
                            )}
                            {status === "error" && (
                                <button onClick={onRetry} className="text-red-500 hover:text-red-400 transition-colors" title="재전송">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                                </button>
                            )}
                        </div>
                    ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
                            {timeString}
                        </span>
                    )}
                </div>

                {/* AI Context Action Chips - Stitch Design */}
                {!isMe && isAi && type === "TEXT" && status === "sent" && (
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar w-full pb-1">
                        <button
                            onClick={onRegenerate}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#283339] border border-[#3e4c54] hover:bg-[#3e4c54] active:scale-95 transition-all group shrink-0"
                        >
                            <HugeiconsIcon icon={Rotate01Icon} className="w-3.5 h-3.5 text-[#13a4ec] group-hover:text-white" />
                            <span className="text-[11px] font-medium text-[#9db0b9] group-hover:text-white">Regenerate</span>
                        </button>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(content);
                                onCopy?.();
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#283339] border border-[#3e4c54] hover:bg-[#3e4c54] active:scale-95 transition-all group shrink-0"
                        >
                            <HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5 text-[#9db0b9] group-hover:text-white" />
                            <span className="text-[11px] font-medium text-[#9db0b9] group-hover:text-white">Copy</span>
                        </button>

                        <button
                            onClick={onShare}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#283339] border border-[#3e4c54] hover:bg-[#3e4c54] active:scale-95 transition-all group shrink-0"
                        >
                            <HugeiconsIcon icon={Share01Icon} className="w-3.5 h-3.5 text-[#9db0b9] group-hover:text-white" />
                            <span className="text-[11px] font-medium text-[#9db0b9] group-hover:text-white">Share</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 내 아바타 (오른쪽) - Stitch Design에서는 내 아바타를 표시하지 않음 */}
            {/* {isMe && avatarElement} */}
        </div>
    );
}
