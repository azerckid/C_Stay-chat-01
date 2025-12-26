
import { prisma } from "../app/lib/db.server";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  // DB 연결 URL 확인용
  const dbUrl = process.env.DATABASE_URL || "unknown";
  console.log(`🛠️ Connecting to DB: ${dbUrl.substring(0, 15)}...`);
  if (!dbUrl.includes("turso") && !dbUrl.includes("libsql") && !dbUrl.includes("wss")) {
    console.warn("⚠️  WARNING: It seems we are NOT connecting to Turso/LibSQL!");
    console.warn("    URL:", dbUrl);
  } else {
    console.log("✅ Using Remote Turso DB");
  }

  console.log("🛠️ Fixing DB Schema: Creating missing tables...");

  try {
    // 1. verification 테이블 생성
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "createdAt" DATETIME,
        "updatedAt" DATETIME
      );
    `);
    console.log("✅ Table 'verification' created or already exists.");

    // 2. account 테이블도 확인 (혹시 모르니)
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "account" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "accountId" TEXT NOT NULL,
          "providerId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "accessToken" TEXT,
          "refreshToken" TEXT,
          "idToken" TEXT,
          "accessTokenExpiresAt" DATETIME,
          "refreshTokenExpiresAt" DATETIME,
          "scope" TEXT,
          "password" TEXT,
          "createdAt" DATETIME NOT NULL,
          "updatedAt" DATETIME NOT NULL,
          FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
    console.log("✅ Table 'account' checked.");

    // 3. session 테이블 확인
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "session" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "expiresAt" DATETIME NOT NULL,
          "token" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL,
          "updatedAt" DATETIME NOT NULL,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "userId" TEXT NOT NULL,
          FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
    console.log("✅ Table 'session' checked.");

    // 4. user 테이블 확인 (기존에 있었지만 전체성 위해)
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "user" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "emailVerified" BOOLEAN NOT NULL DEFAULT false,
          "image" TEXT,
          "avatarUrl" TEXT,
          "status" TEXT NOT NULL DEFAULT 'OFFLINE',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
        );
    `);
    console.log("✅ Table 'user' checked.");

  } catch (error) {
    console.error("❌ Failed to create tables:", error);
  } finally {
    console.log("Done.");
  }
}

main();
