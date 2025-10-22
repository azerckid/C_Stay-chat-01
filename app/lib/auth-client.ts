import { createAuthClient } from "better-auth/react";

/**
 * STAYnC 인증 클라이언트
 * AUTH_PLAN.md에 따라 baseURL을 /auth로 명시하여 모든 세션/로그인 요청이 
 * 우리 라우터의 /auth/* 경로로 명중하게 합니다.
 */
export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined"
        ? `${window.location.origin}/auth`
        : "http://localhost:5173/auth",
});
