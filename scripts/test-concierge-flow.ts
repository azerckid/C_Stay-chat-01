
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🚀 Starting Concierge Flow Test...");

    const TEST_EMAIL = "test_user_concierge@example.com";
    const AI_EMAIL = "ai@staync.com";

    // 1. Create or Get Test User
    let user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: TEST_EMAIL,
                name: "Test User",
                status: "ONLINE",
            },
        });
        console.log("✅ Created Test User:", user.id);
    } else {
        console.log("ℹ️ Found Test User:", user.id);
    }

    // 2. Ensure AI User Exists (Logic from concierge.tsx)
    let aiUser = await prisma.user.findUnique({ where: { email: AI_EMAIL } });
    if (!aiUser) {
        aiUser = await prisma.user.create({
            data: {
                email: AI_EMAIL,
                name: "STAYnC Concierge",
                status: "ONLINE",
                emailVerified: true,
            },
        });
        console.log("✅ Created AI User:", aiUser.id);
    } else {
        console.log("ℹ️ Found AI User:", aiUser.id);
    }

    // 3. Find One-on-One Room
    const myRooms = await prisma.roomMember.findMany({
        where: { userId: user.id },
        select: { roomId: true },
    });

    const aiRooms = await prisma.roomMember.findMany({
        where: { userId: aiUser.id },
        select: { roomId: true },
    });

    let targetRoomId: string | null = null;
    for (const myRoom of myRooms) {
        if (aiRooms.some((aiRoom) => aiRoom.roomId === myRoom.roomId)) {
            const count = await prisma.roomMember.count({
                where: { roomId: myRoom.roomId },
            });
            if (count === 2) {
                targetRoomId = myRoom.roomId;
                break;
            }
        }
    }

    // 4. Create Room if not exists
    if (!targetRoomId) {
        console.log("Creating new Concierge Room...");
        const newRoomId = crypto.randomUUID();

        // Compatibility: Conversation
        await prisma.conversation.create({
            data: {
                id: newRoomId,
                title: "Concierge Chat",
            },
        });

        const newRoom = await prisma.room.create({
            data: {
                id: newRoomId,
                name: "STAYnC Concierge",
                members: {
                    create: [
                        { userId: user.id },
                        { userId: aiUser.id }
                    ]
                }
            },
        });
        targetRoomId = newRoom.id;
        console.log("✅ Created New Room:", targetRoomId);
    } else {
        console.log("ℹ️ Found Existing Room:", targetRoomId);
    }

    // 5. Simulate Sending a Message (Logic from api.messages.ts)
    console.log("📩 Sending User Message...");
    const content = "Hello, can you help me with a trip to Seoul?";

    // Ensure conversation exists (Safety check)
    const conversation = await prisma.conversation.findUnique({ where: { id: targetRoomId } });
    if (!conversation) {
        console.log("⚠️ Conversation missing, recreating...");
        await prisma.conversation.create({
            data: { id: targetRoomId, title: "Recreated Chat" }
        });
    }

    const message = await prisma.message.create({
        data: {
            roomId: targetRoomId,
            senderId: user.id,
            content,
            type: "TEXT",
            role: "user",
            conversationId: targetRoomId, // CRITICAL: This caused errors before
        }
    });

    console.log("✅ Message Sent Successfully:", message.id);
    console.log("🎉 Concierge Flow Verification Passed!");
}

main()
    .catch((e) => {
        console.error("❌ Test Failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
