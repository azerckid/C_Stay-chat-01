import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router";
import React from "react";

interface PageTransitionProps {
    children: React.ReactNode;
}

/**
 * 페이지 이동 시 Slide-with-Fade 전환 효과를 제공하는 컴포넌트입니다.
 * Framer Motion을 활용하여 프리미엄한 앱 체감을 제공합니다.
 */
export function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                    duration: 0.25,
                    ease: [0.32, 0.72, 0, 1] // 프리미엄 가속도 곡선
                }}
                className="flex-1 w-full flex flex-col"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
