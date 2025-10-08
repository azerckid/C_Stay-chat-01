import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/**
 * Prisma Client를 싱글톤 패턴으로 관리하여 개발 환경에서 
 * Hot Module Replacement(HMR) 발생 시 연결 풀이 고갈되는 것을 방지합니다.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const config = {
    url: process.env.DATABASE_URL || "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
};

const adapter = new PrismaLibSql(config);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
