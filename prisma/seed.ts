import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";

const config = {
    url: process.env.DATABASE_URL || "file:./dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
};

const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    // 1. Clear existing data (optional, but good for clean seed)
    // Note: Delete order matters because of relations
    await prisma.todo.deleteMany();
    await prisma.agentExecution.deleteMany();
    await prisma.message.deleteMany();
    await prisma.roomMember.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users
    const user1 = await prisma.user.create({
        data: {
            email: "guest@staync.com",
            name: "Guest User",
            status: "ONLINE",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
        },
    });

    const aiAssistant = await prisma.user.create({
        data: {
            email: "ai@staync.com",
            name: "STAYnC AI",
            status: "ONLINE",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=STAYnC",
        },
    });

    console.log(`✅ Created users: ${user1.name}, ${aiAssistant.name}`);

    // 3. Create a Room
    const room = await prisma.room.create({
        data: {
            name: "Welcome Chat",
            type: "GROUP",
        },
    });

    console.log(`✅ Created room: ${room.name}`);

    // 4. Add Members to Room
    await prisma.roomMember.createMany({
        data: [
            { userId: user1.id, roomId: room.id, role: "OWNER" },
            { userId: aiAssistant.id, roomId: room.id, role: "MEMBER" },
        ],
    });

    // 5. Create initial Messages
    await prisma.message.create({
        data: {
            content: "Hello! Welcome to STAYnC Chat.",
            type: "SYSTEM",
            senderId: aiAssistant.id,
            roomId: room.id,
        },
    });

    await prisma.message.create({
        data: {
            content: "How can I help you today with your travel plans?",
            type: "TEXT",
            senderId: aiAssistant.id,
            roomId: room.id,
        },
    });

    console.log("✅ Seed data injected successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
