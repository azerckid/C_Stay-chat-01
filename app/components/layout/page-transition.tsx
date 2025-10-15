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
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1] // 부드러운 Ease-Out
                }}
                className="flex-1 w-full flex flex-col"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
