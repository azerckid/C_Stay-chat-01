import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logoDark from "~/welcome/logo-dark.svg";

/**
 * 앱 초기 진입 시 브랜드 아이덴티티를 노출하는 스플래시 화면입니다.
 */
export function SplashScreen({ onFinish }: { onFinish?: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onFinish?.();
        }, 2000); // 2초간 노출
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Background Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-blue/20 rounded-full blur-[120px]" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="z-10 flex flex-col items-center space-y-8"
                    >
                        <img
                            src={logoDark}
                            alt="STAYnC"
                            className="h-20 w-auto drop-shadow-[0_0_20px_rgba(0,209,255,0.4)]"
                        />

                        <div className="flex flex-col items-center space-y-2">
                            <h1 className="text-4xl font-bold tracking-tighter text-glow-blue">STAYnC</h1>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Loading Excellence</span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                        <span className="text-[10px] font-medium text-white/20 tracking-wider">NEXT GENERATION TRAVEL CONCIERGE</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
