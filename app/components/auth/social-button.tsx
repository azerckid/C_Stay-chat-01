import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface SocialButtonProps {
    provider: "google" | "kakao";
    onClick?: () => void;
    isLoading?: boolean;
}

/**
 * STAYnC 프리미엄 디자인이 적용된 소셜 로그인 버튼입니다.
 * 브랜드 컬러와 글래스모피즘 효과를 결합하였습니다.
 */
export function SocialButton({ provider, onClick, isLoading }: SocialButtonProps) {
    const isGoogle = provider === "google";

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={isLoading}
            className={cn(
                "relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300",
                "border backdrop-blur-md overflow-hidden group",
                isGoogle
                    ? "bg-white/5 border-white/10 text-white hover:border-white/20"
                    : "bg-[#FEE500] border-transparent text-[#191919] hover:bg-[#FDE000]",
                isLoading && "opacity-50 cursor-not-allowed"
            )}
        >
            {/* Premium Glow Effect for Google */}
            {isGoogle && (
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/0 via-neon-blue/10 to-neon-blue/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            )}

            {/* Provider Icon */}
            {isGoogle ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
            ) : (
                <svg className="w-5 h-5 text-[#191919]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c-4.97 0-9 3.18-9 7.11 0 2.53 1.65 4.75 4.14 6.01l-.81 2.99c-.04.14.01.3.13.39a.38.38 0 0 0 .39.01l3.52-2.33c.53.07 1.07.11 1.63.11 4.97 0 9-3.18 9-7.11S16.97 3 12 3z" />
                </svg>
            )}

            <span className="relative z-10">
                {isGoogle ? "Google로 시작하기" : "카카오톡으로 시작하기"}
            </span>

            {isLoading && (
                <div className="absolute right-4 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
        </motion.button>
    );
}
