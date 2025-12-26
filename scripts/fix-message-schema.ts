
import { prisma } from "../app/lib/db.server";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
    console.log("🛠️ Fixing Message table schema...");

    const dbUrl = process.env.DATABASE_URL || "unknown";
    if (!dbUrl.includes("turso") && !dbUrl.includes("libsql") && !dbUrl.includes("wss")) {
        console.warn("⚠️  WARNING: Not connection to Turso/LibSQL!");
        return;
    }

    try {
        // Message 테이블에 type 컬럼 추가
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Message" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'TEXT';`);
            console.log("✅ Added column 'type' to Table 'Message'");
        } catch (e: any) {
            if (e.message.includes("duplicate column")) {
                console.log("ℹ️  Column 'type' already exists in 'Message'.");
            } else {
                // 혹시 테이블 이름 대소문자 문제일 수도 있으니 소문자로도 시도
                try {
                    await prisma.$executeRawUnsafe(`ALTER TABLE "message" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'TEXT';`);
                    console.log("✅ Added column 'type' to Table 'message' (lowercase)");
                } catch (e2) {
                    console.log("⚠️  Could not add 'type' column:", e.message.split('\n')[0]);
                }
            }
        }

    } catch (error) {
        console.error("❌ Failed to alter table:", error);
    } finally {
        console.log("Done.");
    }
}

main();
