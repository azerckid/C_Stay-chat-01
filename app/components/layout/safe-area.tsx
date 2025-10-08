import { cn } from "~/lib/utils";

interface SafeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    /**
     * 상단 세이프 영역 무시 여부 (배경이 최상단까지 뻗어야 할 경우)
     */
    ignoreTop?: boolean;
    /**
     * 하단 세이프 영역 무시 여부 (배경이 최하단까지 뻗어야 할 경우)
     */
    ignoreBottom?: boolean;
}

/**
 * 모바일 상단 노치(Notch) 및 하단 홈 바(Home Bar) 영역을 보호하는 프리미엄 컨테이너입니다.
 * iOS/Android 하이브리드 환경에서 레이아웃 깨짐을 방지합니다.
 */
export function SafeArea({
    children,
    className,
    ignoreTop = false,
    ignoreBottom = false,
    ...props
}: SafeAreaProps) {
    return (
        <div
            className={cn(
                "flex flex-col min-h-screen w-full bg-background",
                !ignoreTop && "pt-[env(safe-area-inset-top)]",
                !ignoreBottom && "pb-[env(safe-area-inset-bottom)]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
