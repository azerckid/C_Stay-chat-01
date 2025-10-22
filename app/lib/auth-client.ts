import { createAuthClient } from "better-auth/react";

/**
 * 프론트엔드에서 인증 기능을 사용하기 위한 클라이언트입니다.
 * 소셜 로그인 요청 및 세션 확인 기능을 제공합니다.
 */
export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
});
