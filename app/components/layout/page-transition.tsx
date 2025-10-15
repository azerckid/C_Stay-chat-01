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
                initial={{ opacity: 0, y: 150 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -150 }}
                transition={{
                    duration: 1.6,
                    ease: [0.19, 1, 0.22, 1] // 더욱 웅장하고 부드러운 Ease-Out
                }}
                style={{ width: "100%" }}
                className="flex-1 flex flex-col"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
