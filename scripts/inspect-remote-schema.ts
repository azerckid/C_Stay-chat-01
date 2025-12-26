
import { prisma } from "../app/lib/db.server";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
    console.log("🔍 Inspecting REMOTE Turso DB Schema...");

    const dbUrl = process.env.DATABASE_URL || "unknown";
    if (!dbUrl.includes("turso") && !dbUrl.includes("libsql") && !dbUrl.includes("wss")) {
        console.warn("⚠️  WARNING: Not connecting to Turso/LibSQL!");
    }

    try {
        // Message 테이블의 CREATE TABLE 문 조회 (모든 컬럼, 제약조건 포함)
        const result = await prisma.$queryRaw`SELECT sql FROM sqlite_master WHERE type='table' AND name='Message'`;
        console.log("\n=== Message Table Schema (Remote) ===");
        console.dir(result, { depth: null });

        // Conversation 테이블도 확인 (FK 대상)
        const convResult = await prisma.$queryRaw`SELECT sql FROM sqlite_master WHERE type='table' AND name='Conversation'`;
        console.log("\n=== Conversation Table Schema (Remote) ===");
        console.dir(convResult, { depth: null });

    } catch (error) {
        console.error("❌ Failed to inspect schema:", error);
    }
}

main();
