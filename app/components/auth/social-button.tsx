import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface SocialButtonProps {
    provider: "google" | "kakao";
    onClick?: () => void;
    isLoading?: boolean;
}

/**
 * Stitch 디자인 스타일의 소셜 로그인 버튼입니다.
 * Material Design 3 스타일의 깔끔하고 현대적인 디자인을 제공합니다.
 */
export function SocialButton({ provider, onClick, isLoading }: SocialButtonProps) {
    const isGoogle = provider === "google";

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={isLoading}
            className={cn(
                "w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200",
                "shadow-sm active:scale-[0.98]",
                isGoogle
                    ? "bg-white dark:bg-card border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-muted text-gray-700 dark:text-foreground"
                    : "bg-[#FEE500] hover:bg-[#ebd300] text-[#3C1E1E] border-transparent",
                isLoading && "opacity-50 cursor-not-allowed"
            )}
        >
            {/* Provider Icon */}
            {isGoogle ? (
                <img
                    alt="Google Logo"
                    className="w-5 h-5"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeqV1hAPN1zKyK7k7b3JE71lozy2LuTZkjNcYuiYVtwpQq-yFReXfmXcLXKeDW10eMpS5wUO98-LWBFJNOegMPPMJQlG-IoU-ZT2A-zu3zEfweHW9DADIXs4mIpuA3Bm6C0xMpcarwcqdSKk7DOD6LkB9Qaus25FwcAyRzs4jnKRkfgV-WJ3cmGayzXaYQcDLcLIPX5h4fIh0WmmD0OAQGoNHX_YtGDl4p00Id18ru2VPnUs427O9jbRs2sMgtuBpVpxJN7xyOxXH-"
                />
            ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3C5.925 3 1 6.925 1 11.775C1 14.65 2.875 17.15 5.675 18.725L4.85 21.8C4.775 22.025 5.025 22.25 5.25 22.1L9.125 19.55C10.05 19.7 11.025 19.8 12 19.8C18.075 19.8 23 15.875 23 11.025C23 6.175 18.075 3 12 3Z" />
                </svg>
            )}

            <span>
                {isGoogle ? "Continue with Google" : "Login with Kakao"}
            </span>

            {isLoading && (
                <div className="absolute right-4 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
        </motion.button>
    );
}
