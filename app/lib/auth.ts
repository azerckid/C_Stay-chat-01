import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.server";

/**
 * STAYnC 인증 엔진 (AUTH_PLAN.md 준수)
 * 리다이렉트 경로는 플랜에 정의된 대로 고정합니다.
 */
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "sqlite",
    }),
    // 플랜의 2.1 항목에 따라 /auth 경로를 기본으로 사용합니다.
    advanced: {
        basePath: "/auth",
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            // AUTH_PLAN.md 2.1.2 정의 준수
            redirectURI: "http://localhost:5173/auth/google/callback",
        },
        kakao: {
            clientId: process.env.KAKAO_CLIENT_ID || "",
            clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
            // AUTH_PLAN.md 2.1.2 정의 준수
            redirectURI: "http://localhost:5173/auth/kakao/callback",
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
});
