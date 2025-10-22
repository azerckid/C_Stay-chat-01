import { motion } from "framer-motion";
import { SafeArea, AppHeader } from "../components/layout";
import { SocialButton } from "../components/auth/social-button";
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

        // 1. 사용자에게 피드백 먼저 제공
        toast.success(`${provider} 로그인 페이지로 이동합니다...`);

        try {
            // 2. 토스트를 1초간 보여주기 위해 강제 지연
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const { error } = await authClient.signIn.social({
                provider,
                callbackURL: redirectTo, // 동적 리다이렉트 경로 적용
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

    return (
        <SafeArea className="items-center justify-center p-6 bg-background overflow-hidden relative">
            <AppHeader title="Sign In" showBack={false} />

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/20 rounded-full blur-[100px]" />
            </div>

            <div className="flex-1 flex flex-col justify-center w-full max-w-sm z-10 space-y-12">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 mx-auto bg-gradient-to-tr from-neon-purple to-neon-blue rounded-3xl flex items-center justify-center shadow-lg shadow-neon-purple/20 mb-6"
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-bold bg-gradient-to-r from-neon-blue via-white to-neon-purple bg-clip-text text-transparent"
                    >
                        Welcome Back
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-muted-foreground text-lg"
                    >
                        AI 프리미엄 컨시어지 서비스를 경험하세요
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <SocialButton
                        provider="google"
                        onClick={() => handleLogin("google")}
                        isLoading={loadingProvider === "google"}
                    />
                    <SocialButton
                        provider="kakao"
                        onClick={() => handleLogin("kakao")}
                        isLoading={loadingProvider === "kakao"}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <p className="text-xs text-muted-foreground/60 leading-relaxed px-8">
                        로그인 시 <span className="text-white/80 underline decoration-white/20">이용약관</span> 및 <span className="text-white/80 underline decoration-white/20">개인정보처리방침</span>에 동의하게 됩니다.
                    </p>
                </motion.div>
            </div>
        </SafeArea>
    );
}
