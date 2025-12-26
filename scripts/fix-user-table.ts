
import { prisma } from "../app/lib/db.server";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
    console.log("🛠️ Adding missing columns to User table...");

    const dbUrl = process.env.DATABASE_URL || "unknown";
    if (!dbUrl.includes("turso") && !dbUrl.includes("libsql") && !dbUrl.includes("wss")) {
        console.warn("⚠️  WARNING: Not connected to Turso/LibSQL!");
        return;
    }

    try {
        // 1. emailVerified 추가
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "user" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;`);
            console.log("✅ Added column 'emailVerified'");
        } catch (e: any) {
            if (e.message.includes("duplicate column")) {
                console.log("ℹ️  Column 'emailVerified' already exists.");
            } else {
                console.log("⚠️  Could not add 'emailVerified' (might already exist):", e.message.split('\n')[0]);
            }
        }

        // 2. image 추가 (기존 User 테이블에 image 컬럼이 있다면 이 단계는 실패하겠지만 괜찮음)
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "user" ADD COLUMN "image" TEXT;`);
            console.log("✅ Added column 'image'");
        } catch (e: any) {
            console.log("ℹ️  Column 'image' likely already exists.");
        }

        // 3. avatarUrl 추가
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "user" ADD COLUMN "avatarUrl" TEXT;`);
            console.log("✅ Added column 'avatarUrl'");
        } catch (e: any) {
            console.log("ℹ️  Column 'avatarUrl' likely already exists.");
        }

        // 4. status 추가
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "user" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'OFFLINE';`);
            console.log("✅ Added column 'status'");
        } catch (e: any) {
            console.log("ℹ️  Column 'status' likely already exists.");
        }

    } catch (error) {
        console.error("❌ Failed to alter table:", error);
    } finally {
        console.log("Done.");
    }
}

main();
