import { SafeArea } from "../components/layout";
import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";
import { useSearchParams, Link } from "react-router";

export default function SignupPage() {
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/";

    const handleSocialSignup = async (provider: "google" | "kakao") => {
        setLoadingProvider(provider);

        toast.success(`${provider} 회원가입 페이지로 이동합니다...`);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const { error } = await authClient.signIn.social({
                provider,
                callbackURL: redirectTo,
            });

            if (error) {
                toast.error(`${provider} 회원가입 중 오류가 발생했습니다.`);
                console.error("Auth error:", error);
                setLoadingProvider(null);
            }
        } catch (err) {
            toast.error("인증 시스템에 연결할 수 없습니다.");
            console.error("System error:", err);
            setLoadingProvider(null);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (password.length < 8) {
            toast.error("비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Better Auth에 email/password 인증이 설정되면 구현
            toast.info("이메일 회원가입은 현재 준비 중입니다. 소셜 로그인을 이용해주세요.");
            setIsLoading(false);
        } catch (err) {
            toast.error("회원가입 중 오류가 발생했습니다.");
            console.error("Signup error:", err);
            setIsLoading(false);
        }
    };

    return (
        <SafeArea className="flex flex-col justify-center items-center p-6 bg-background overflow-hidden relative min-h-screen">
            {/* Background Effects - Stitch Design */}
            <div className="fixed top-0 left-0 -z-10 w-96 h-96 rounded-full blur-3xl opacity-50 pointer-events-none transform -translate-x-1/3 -translate-y-1/3" style={{ backgroundColor: "rgba(236, 72, 153, 0.1)" }} />
            <div className="fixed bottom-0 right-0 -z-10 w-96 h-96 rounded-full blur-3xl opacity-50 pointer-events-none transform translate-x-1/3 translate-y-1/3" style={{ backgroundColor: "rgba(14, 165, 233, 0.1)" }} />

            <div className="w-full max-w-sm mx-auto flex flex-col items-center relative z-10">
                {/* Header */}
                <div className="text-center mb-8 w-full">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Join us to start your conversation
                    </p>
                </div>

                {/* Email/Password Form */}
                <form
                    onSubmit={handleEmailSignup}
                    className="w-full space-y-4 mb-6"
                >
                    {/* Email Input */}
                    <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 transition-colors group-focus-within:!text-[#ec4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base"
                            style={{
                                "--tw-ring-color": "rgba(236, 72, 153, 0.5)",
                            } as React.CSSProperties & { "--tw-ring-color": string }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "#ec4899";
                                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(236, 72, 153, 0.5)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "";
                                e.currentTarget.style.boxShadow = "";
                            }}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 transition-colors group-focus-within:!text-[#ec4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base"
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "#ec4899";
                                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(236, 72, 153, 0.5)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "";
                                e.currentTarget.style.boxShadow = "";
                            }}
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 transition-colors group-focus-within:!text-[#ec4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base"
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "#ec4899";
                                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(236, 72, 153, 0.5)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "";
                                e.currentTarget.style.boxShadow = "";
                            }}
                        />
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: "#ec4899",
                            boxShadow: "0 10px 15px -3px rgba(236, 72, 153, 0.25), 0 4px 6px -2px rgba(236, 72, 153, 0.25)",
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) e.currentTarget.style.backgroundColor = "#db2777";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#ec4899";
                        }}
                    >
                        <span>Sign Up</span>
                        <svg className="w-3 h-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </form>

                {/* Divider */}
                <div className="w-full relative flex py-2 items-center mb-6 px-2">
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
                    <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-widest font-semibold">
                        Or sign up with
                    </span>
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
                </div>

                {/* Social Buttons - Grid Layout */}
                <div className="w-full grid grid-cols-2 gap-3 mb-8">
                    <button
                        onClick={() => handleSocialSignup("google")}
                        disabled={loadingProvider === "google"}
                        className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <img
                            alt="Google Logo"
                            className="w-5 h-5"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeqV1hAPN1zKyK7k7b3JE71lozy2LuTZkjNcYuiYVtwpQq-yFReXfmXcLXKeDW10eMpS5wUO98-LWBFJNOegMPPMJQlG-IoU-ZT2A-zu3zEfweHW9DADIXs4mIpuA3Bm6C0xMpcarwcqdSKk7DOD6LkB9Qaus25FwcAyRzs4jnKRkfgV-WJ3cmGayzXaYQcDLcLIPX5h4fIh0WmmD0OAQGoNHX_YtGDl4p00Id18ru2VPnUs427O9jbRs2sMgtuBpVpxJN7xyOxXH-"
                        />
                        <span className="text-sm">Google</span>
                    </button>
                    <button
                        onClick={() => handleSocialSignup("kakao")}
                        disabled={loadingProvider === "kakao"}
                        className="w-full bg-[#FEE500] hover:bg-[#ebd300] text-[#3C1E1E] font-medium py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 text-[#3C1E1E]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3C5.925 3 1 6.925 1 11.775C1 14.65 2.875 17.15 5.675 18.725L4.85 21.8C4.775 22.025 5.025 22.25 5.25 22.1L9.125 19.55C10.05 19.7 11.025 19.8 12 19.8C18.075 19.8 23 15.875 23 11.025C23 6.175 18.075 3 12 3Z" />
                        </svg>
                        <span className="text-sm">Kakao</span>
                    </button>
                </div>

                {/* Footer Links */}
                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold hover:underline transition-colors"
                            style={{ color: "#ec4899" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#db2777";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#ec4899";
                            }}
                        >
                            Log In
                        </Link>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed px-2">
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
