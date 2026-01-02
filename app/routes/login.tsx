import { SafeArea } from "../components/layout";
import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";
import { useSearchParams } from "react-router";

export default function LoginPage() {
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/";

    const handleLogin = async (provider: "google" | "kakao") => {
        setLoadingProvider(provider);

        toast.success(`${provider} 로그인 페이지로 이동합니다...`);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const { error } = await authClient.signIn.social({
                provider,
                callbackURL: redirectTo,
            });

            if (error) {
                toast.error(`${provider} 로그인 중 오류가 발생했습니다.`);
                console.error("Auth error:", error);
                setLoadingProvider(null);
            }
        } catch (err) {
            toast.error("인증 시스템에 연결할 수 없습니다.");
            console.error("System error:", err);
            setLoadingProvider(null);
        }
    };

    const handleEmailLogin = () => {
        toast.info("이메일 로그인은 현재 준비 중입니다. 소셜 로그인을 이용해주세요.");
    };

    return (
        <SafeArea className="flex flex-col justify-center items-center p-6 bg-background overflow-hidden relative min-h-screen">
            {/* Background Effects - Stitch Design */}
            <div className="fixed top-0 left-0 -z-10 w-96 h-96 rounded-full blur-3xl opacity-50 pointer-events-none transform -translate-x-1/3 -translate-y-1/3" style={{ backgroundColor: "rgba(236, 72, 153, 0.1)" }} />
            <div className="fixed bottom-0 right-0 -z-10 w-96 h-96 rounded-full blur-3xl opacity-50 pointer-events-none transform translate-x-1/3 translate-y-1/3" style={{ backgroundColor: "rgba(14, 165, 233, 0.1)" }} />

            <div className="w-full max-w-sm mx-auto flex flex-col items-center relative z-10">
                <div className="w-full space-y-4 mb-12">
                    <div className="text-center mb-6">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            Log in to continue your conversation
                        </p>
                    </div>

                    <button
                        onClick={() => handleLogin("google")}
                        disabled={loadingProvider === "google"}
                        className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <img
                            alt="Google Logo"
                            className="w-5 h-5"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeqV1hAPN1zKyK7k7b3JE71lozy2LuTZkjNcYuiYVtwpQq-yFReXfmXcLXKeDW10eMpS5wUO98-LWBFJNOegMPPMJQlG-IoU-ZT2A-zu3zEfweHW9DADIXs4mIpuA3Bm6C0xMpcarwcqdSKk7DOD6LkB9Qaus25FwcAyRzs4jnKRkfgV-WJ3cmGayzXaYQcDLcLIPX5h4fIh0WmmD0OAQGoNHX_YtGDl4p00Id18ru2VPnUs427O9jbRs2sMgtuBpVpxJN7xyOxXH-"
                        />
                        <span>Continue with Google</span>
                    </button>

                    <button
                        onClick={() => handleLogin("kakao")}
                        disabled={loadingProvider === "kakao"}
                        className="w-full bg-[#FEE500] hover:bg-[#ebd300] text-[#3C1E1E] font-medium py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 text-[#3C1E1E]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3C5.925 3 1 6.925 1 11.775C1 14.65 2.875 17.15 5.675 18.725L4.85 21.8C4.775 22.025 5.025 22.25 5.25 22.1L9.125 19.55C10.05 19.7 11.025 19.8 12 19.8C18.075 19.8 23 15.875 23 11.025C23 6.175 18.075 3 12 3Z" />
                        </svg>
                        <span>Login with Kakao</span>
                    </button>

                    <div className="relative flex py-2 items-center px-2">
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
                        <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-widest font-semibold">
                            Or
                        </span>
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
                    </div>

                    <button
                        onClick={handleEmailLogin}
                        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-none flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Continue with Email</span>
                    </button>
                </div>

                <div className="text-center px-6">
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                        By continuing, you agree to our{" "}
                        <a
                            href="#"
                            className="font-medium hover:underline underline-offset-2 transition-colors"
                            style={{ color: "#ec4899" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = "0.8";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = "1";
                            }}
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="#"
                            className="font-medium hover:underline underline-offset-2 transition-colors"
                            style={{ color: "#ec4899" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = "0.8";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = "1";
                            }}
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </SafeArea>
    );
}
