
import { prisma } from "../app/lib/db.server";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
    console.log("🛠️ Fixing Message table schema (adding relation columns)...");

    const dbUrl = process.env.DATABASE_URL || "unknown";
    if (!dbUrl.includes("turso") && !dbUrl.includes("libsql") && !dbUrl.includes("wss")) {
        console.warn("⚠️  WARNING: Not connection to Turso/LibSQL!");
        return;
    }

    try {
        // 1. senderId 추가
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Message" ADD COLUMN "senderId" TEXT;`);
            console.log("✅ Added column 'senderId'");
        } catch (e: any) {
            console.log("ℹ️  Column 'senderId' likely already exists or error:", e.message.split('\n')[0]);
        }

        // 2. roomId 추가
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Message" ADD COLUMN "roomId" TEXT;`);
            console.log("✅ Added column 'roomId'");
        } catch (e: any) {
            console.log("ℹ️  Column 'roomId' likely already exists or error:", e.message.split('\n')[0]);
        }

        // 3. read 추가
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Message" ADD COLUMN "read" BOOLEAN NOT NULL DEFAULT false;`);
            console.log("✅ Added column 'read'");
        } catch (e: any) {
            console.log("ℹ️  Column 'read' likely already exists or error:", e.message.split('\n')[0]);
        }

    } catch (error) {
        console.error("❌ Failed to alter table:", error);
    } finally {
        console.log("Done.");
    }
}

main();
