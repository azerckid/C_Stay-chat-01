import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("chat", "routes/chat.tsx", { id: "chat" }),
    route("chat/:roomId", "routes/chat.$roomId.tsx", { id: "chat-room" }),

    // API Routes (Resource Routes)
    route("api/rooms", "routes/api.rooms.ts", { id: "api-rooms" }),
    route("api/messages", "routes/api.messages.ts"),
    route("api/upload", "routes/api.upload.ts"),
    route("api/typing", "routes/api.typing.ts"), // Typing Indicator API 등록
    route("api/read", "routes/api.read.ts"), // Read Receipt API 등록
    route("api/rooms/:roomId/messages", "routes/api.rooms.$roomId.messages.ts", { id: "api-room-messages" }),

    route("concierge", "routes/concierge.tsx", { id: "concierge" }),
    route("login", "routes/login.tsx", { id: "login" }),
    route("signup", "routes/signup.tsx", { id: "signup" }),
    route("profile", "routes/profile.tsx", { id: "profile" }),

    // [AUTH_PLAN.md 명세 준수] 물리적 파일 경로와 URL을 1:1로 매칭
    route("auth/google/callback", "routes/auth/google/callback.ts", { id: "auth-google-callback" }),
    route("auth/kakao/callback", "routes/auth/kakao/callback.ts", { id: "auth-kakao-callback" }),

    // 나머지 /auth/* 요청 처리
    route("auth/*", "routes/auth/$.ts", { id: "auth-splat" }),
] satisfies RouteConfig;
