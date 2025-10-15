import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.server";

/**
 * Better Auth 설정
 * Prisma 어댑터를 사용하여 데이터베이스 세션을 관리합니다.
 */
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "sqlite", // Turso는 SQLite와 호환됩니다.
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
        // Kakao 등 타 소셜 로그인 추가 가능
    },
    // 세션 설정 (필요 시 수정)
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7일
        updateAge: 60 * 60 * 24, // 1일마다 세션 갱신
    },
});
