import { motion } from "framer-motion";
import { SafeArea, AppHeader } from "../components/layout";
import { SocialButton } from "../components/auth/social-button";
import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";

export default function LoginPage() {
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

    const handleLogin = async (provider: "google" | "kakao") => {
        setLoadingProvider(provider);

        try {
            const { error } = await authClient.signIn.social({
                provider,
                callbackURL: "/", // 로그인 성공 시 이동할 경로
            });

            if (error) {
                toast.error(`${provider} 로그인 중 오류가 발생했습니다.`);
                console.error("Auth error:", error);
            }
        } catch (err) {
            toast.error("인증 시스템에 연결할 수 없습니다.");
            console.error("System error:", err);
        } finally {
            setLoadingProvider(null);
        }
    };

    return (
        <SafeArea className="items-center justify-center p-6 overflow-hidden relative">
            <AppHeader showStatus={false} />

            {/* Decorative Neon Blurs */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-blue/20 rounded-full blur-[120px] animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="z-10 w-full max-w-md space-y-12"
            >
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Secure Access</span>
                    </motion.div>

                    <h1 className="text-5xl font-bold tracking-tighter text-glow-blue">
                        Welcome Back
                    </h1>
                    <p className="text-white/40 font-medium">
                        STAYnC와 함께 프리미엄 여행 컨시어지를 <br />
                        지금 바로 다시 시작하세요.
                    </p>
                </div>

                <div className="glass-card p-8 rounded-[32px] space-y-6 relative overflow-hidden">
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

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

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0A0A0B]/0 px-2 text-white/20 font-medium tracking-widest">
                                STAYnC Social Authentication
                            </span>
                        </div>
                    </div>

                    <p className="text-center text-[11px] text-white/20 leading-relaxed">
                        로그인 시 STAYnC의 <span className="text-white/40 underline">서비스 이용약관</span> 및
                        <span className="text-white/40 underline"> 개인정보 처리방침</span>에 동의하는 것으로 간주됩니다.
                    </p>
                </div>

                <footer className="text-center">
                    <button className="text-sm font-bold text-white/30 hover:text-white transition-colors">
                        도움이 필요하신가요?
                    </button>
                </footer>
            </motion.div>
        </SafeArea>
    );
}
