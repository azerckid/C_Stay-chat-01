import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.server";

/**
 * STAYnC 인증 엔진 (AUTH_PLAN.md & .env 준수)
 */
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "sqlite",
    }),
    // ✅ 위치 수정: basePath는 최상위 옵션입니다.
    basePath: "/auth",
    advanced: {
        // 필요한 경우 추가적인 고급 설정 (현재는 비워둠)
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            // 구글 콘솔 및 설계도와 일치하는 Redirect URL
            redirectURI: process.env.GOOGLE_REDIRECT_URL,
        },
        kakao: {
            clientId: process.env.KAKAO_CLIENT_ID || "",
            clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
            // 카카오 콘솔 및 설계도와 일치하는 Redirect URL
            redirectURI: process.env.KAKAO_REDIRECT_URL,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
});
