import { useEffect, useState } from "react";
import { useNavigation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 페이지 이동 중 상단에 표시되는 프리미엄 프로그레스 바입니다.
 * 애니메이션 가속도를 조절하여 시스템 응답성을 시각적으로 높입니다.
 */
export function LoadingBar() {
    const navigation = useNavigation();
    const [progress, setProgress] = useState(0);
    const isNavigating = navigation.state !== "idle";

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isNavigating) {
            setProgress(10); // 초기 시작
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev; // 90%에서 대기
                    return prev + (90 - prev) * 0.1; // 점진적 감속 진행
                });
            }, 200);
        } else {
            setProgress(100);
            const timeout = setTimeout(() => {
                setProgress(0);
            }, 400);
            return () => clearTimeout(timeout);
        }

        return () => clearInterval(interval);
    }, [isNavigating]);

    return (
        <AnimatePresence>
            {isNavigating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none"
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_10px_rgba(0,209,255,0.5)] bg-[length:200%_100%]"
                        animate={{
                            width: `${progress}%`,
                            backgroundPosition: ["0% 0%", "100% 0%"]
                        }}
                        transition={{
                            width: { type: "spring", stiffness: 50, damping: 20 },
                            backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
