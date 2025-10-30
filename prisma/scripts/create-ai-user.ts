import { prisma } from "../../app/lib/db.server";
import { randomUUID } from "node:crypto";

async function main() {
    console.log("🤖 AI 유저 생성 확인 중...");

    const existingAI = await prisma.user.findUnique({
        where: { email: "ai@staync.com" }
    });

    if (existingAI) {
        console.log("✅ 이미 'STAYnC AI' 유저가 존재합니다.");
        return;
    }

    const aiUser = await prisma.user.create({
        data: {
            id: randomUUID(),
            email: "ai@staync.com",
            name: "STAYnC AI",
            emailVerified: true,
            status: "ONLINE",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=STAYnC",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=STAYnC",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    });

    console.log(`🎉 AI 유저 생성 완료! ID: ${aiUser.id}`);

    // 웰컴 메시지를 위한 봇 전용 방이 없다면 만들 수도 있음 (생략)
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // await prisma.$disconnect();
    });
