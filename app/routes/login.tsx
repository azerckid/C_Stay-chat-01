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
        <SafeArea className="bg-background">
            <AppHeader title="Sign In" showBack={false} />

            <div className="flex-1 flex flex-col justify-center px-6">
                <div className="mb-12 text-center space-y-2">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent"
                    >
                        Welcome Back
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground"
                    >
                        AI 프리미엄 컨시어지 서비스를 경험하세요
                    </motion.p>
                </div>

                <div className="space-y-4">
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
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground/60">
                        로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                    </p>
                </div>
            </div>
        </SafeArea>
    );
}
