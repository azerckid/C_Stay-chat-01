
import { prisma } from "../app/lib/db.server";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
    console.log("🛠️ Adding chat tables (Room, Message, etc)...");

    // DB 연결 확인
    const dbUrl = process.env.DATABASE_URL || "unknown";
    if (!dbUrl.includes("turso") && !dbUrl.includes("libsql") && !dbUrl.includes("wss")) {
        console.warn("⚠️  WARNING: Not connecting to Turso/LibSQL!");
        return;
    }

    try {
        // 1. Room
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Room" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "type" TEXT NOT NULL DEFAULT 'DIRECT',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `);
        console.log("✅ Created 'Room'");

        // 2. RoomMember
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RoomMember" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "roomId" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'MEMBER',
        "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
        console.log("✅ Created 'RoomMember'");

        // 3. Message
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Message" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'TEXT',
        "senderId" TEXT NOT NULL,
        "roomId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "read" BOOLEAN NOT NULL DEFAULT false,
        FOREIGN KEY ("senderId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
        console.log("✅ Created 'Message'");

        // 4. AgentExecution
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AgentExecution" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "messageId" TEXT NOT NULL,
        "agentName" TEXT NOT NULL,
        "intent" TEXT NOT NULL,
        "promptTokens" INTEGER NOT NULL DEFAULT 0,
        "completionTokens" INTEGER NOT NULL DEFAULT 0,
        "totalTokens" INTEGER NOT NULL DEFAULT 0,
        "rawOutput" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
        console.log("✅ Created 'AgentExecution'");

        // 5. Todo (비서용)
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Todo" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "dueDate" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
        console.log("✅ Created 'Todo'");

        // 인덱스 생성 (성능 위해)
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RoomMember_userId_idx" ON "RoomMember"("userId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RoomMember_roomId_idx" ON "RoomMember"("roomId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Message_roomId_createdAt_idx" ON "Message"("roomId", "createdAt");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Todo_userId_idx" ON "Todo"("userId");`);
        console.log("✅ Created Indexes");

    } catch (error) {
        console.error("❌ Failed to create chat tables:", error);
    } finally {
        console.log("Done.");
    }
}

main();
