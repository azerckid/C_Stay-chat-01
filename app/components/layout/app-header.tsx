import { cn } from "~/lib/utils";
import logoDark from "~/welcome/logo-dark.svg";

interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
    title?: string;
    showLogo?: boolean;
    showStatus?: boolean;
}

/**
 * STAYnC Chat의 시그니처 글래스모피즘 헤더입니다.
 * 모든 페이지 상단에 일관된 프리미엄 아이덴티티를 제공합니다.
 */
export function AppHeader({
    title,
    showLogo = true,
    showStatus = true,
    className,
    ...props
}: AppHeaderProps) {
    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 justify-between",
                "bg-background/40 backdrop-blur-[12px] border-b border-white/5",
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-4">
                {showLogo && (
                    <img
                        src={logoDark}
                        alt="STAYnC"
                        className="h-8 w-auto drop-shadow-[0_0_10px_rgba(0,209,255,0.3)]"
                    />
                )}
                {title && (
                    <h1 className="text-xl font-bold font-sans tracking-tight text-white text-glow-blue">
                        {title}
                    </h1>
                )}
            </div>

            <div className="flex items-center gap-3">
                {/* 헤더 우측 유틸리티 공간 (예: 프로필, 알림 등) */}
                {showStatus && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Online</span>
                    </div>
                )}
            </div>
        </header>
    );
}
