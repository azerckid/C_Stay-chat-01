import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("chat", "routes/chat.tsx"),
    route("login", "routes/login.tsx"),
    route("profile", "routes/profile.tsx"),

    // [AUTH_PLAN.md 명세 준수] 물리적 파일 경로와 URL을 1:1로 매칭
    route("auth/google/callback", "routes/auth/google/callback.ts"),
    route("auth/kakao/callback", "routes/auth/kakao/callback.ts"),

    // 나머지 /auth/* 요청 처리 (로그인 시도, 세션 체크 등)
    route("auth/*", "routes/auth/$.ts"),
] satisfies RouteConfig;
