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

            {/* Background Effects - Stitch Design */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="fixed top-0 left-0 -z-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none transform -translate-x-1/3 -translate-y-1/3" />
                <div className="fixed bottom-0 right-0 -z-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50 pointer-events-none transform translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto z-10">
                <div className="w-full space-y-4 mb-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center mb-6"
                    >
                        <p className="text-muted-foreground text-sm font-medium">
                            Log in to continue your conversation
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                        transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center px-6"
                    >
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            By continuing, you agree to our{" "}
                            <a
                                href="#"
                                className="text-primary hover:text-primary/80 font-medium hover:underline underline-offset-2 transition-colors"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                href="#"
                                className="text-primary hover:text-primary/80 font-medium hover:underline underline-offset-2 transition-colors"
                            >
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </motion.div>
                </div>
            </div>
        </SafeArea>
    );
}
