import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("chat", "routes/chat.tsx"),
    route("login", "routes/login.tsx"),

    /**
     * [AUTH_PLAN.md 2.1 준수]
     * 구글과 카카오의 리다이렉트 콜백을 명시적으로 받아냅니다.
     * 중복 ID 방지를 위해 고유한 이름을 부여합니다.
     */
    route("auth/google/callback", "routes/auth-handler.ts", { id: "auth-google-callback" }),
    route("auth/kakao/callback", "routes/auth-handler.ts", { id: "auth-kakao-callback" }),

    // 기타 인증 API 요청 처리
    route("auth/*", "routes/auth-handler.ts", { id: "auth-generic" }),
] satisfies RouteConfig;
