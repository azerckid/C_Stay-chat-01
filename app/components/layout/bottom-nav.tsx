import { NavLink } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Home01Icon,
    Chat01Icon,
    AiChat01Icon,
    UserIcon
} from "@hugeicons/core-free-icons";
import { cn } from "~/lib/utils";

/**
 * 모바일 환경에 최적화된 하단 네비게이션 탭 바 컴포넌트입니다.
 * 글래스모피즘 디자인과 프리미엄 인터랙션을 제공합니다.
 */
export function BottomNav() {
    const tabs = [
        {
            to: "/",
            label: "홈",
            icon: Home01Icon,
        },
        {
            to: "/chat",
            label: "채팅",
            icon: Chat01Icon,
        },
        {
            to: "/concierge",
            label: "컨시어지",
            icon: AiChat01Icon,
            isPrimary: true,
        },
        {
            to: "/profile",
            label: "내 정보",
            icon: UserIcon,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 bg-background/40 backdrop-blur-[12px] border-t border-white/5">
            <div className="flex items-end justify-between max-w-lg mx-auto">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center gap-1 transition-all duration-300 relative group",
                                tab.isPrimary ? "mb-1" : "mb-0",
                                isActive ? "text-neon-blue" : "text-white/40 hover:text-white/60"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "relative p-2 rounded-2xl transition-all duration-300",
                                    tab.isPrimary && "bg-gradient-to-br from-neon-blue to-neon-purple p-3 text-white shadow-[0_0_20px_rgba(0,209,255,0.3)] mb-2",
                                    isActive && !tab.isPrimary && "bg-white/5"
                                )}>
                                    <HugeiconsIcon
                                        icon={tab.icon}
                                        size={tab.isPrimary ? 28 : 24}
                                        strokeWidth={1.5}
                                    />
                                    {isActive && !tab.isPrimary && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(0,209,255,1)]" />
                                    )}
                                </div>
                                {!tab.isPrimary && (
                                    <span className="text-[10px] font-bold tracking-tighter uppercase">
                                        {tab.label}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
