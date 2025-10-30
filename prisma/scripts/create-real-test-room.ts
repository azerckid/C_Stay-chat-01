import { prisma } from "../../app/lib/db.server";

async function main() {
    console.log("🛠️ 'Henry'와 'azerc coder' 연결 시도 중...");

    // 1. 유저 찾기 (이름이나 이메일 기반)
    const henry = await prisma.user.findFirst({
        where: { OR: [{ name: { contains: "Henry" } }, { email: { contains: "fan2soft" } }] }
    });
    const azerc = await prisma.user.findFirst({
        where: { OR: [{ name: { contains: "azerc" } }, { email: { contains: "azerc" } }] }
    });

    if (!henry || !azerc) {
        console.error("❌ 유저를 찾지 못했습니다.");
        console.log("Henry:", henry);
        console.log("Azerc:", azerc);
        return;
    }

    console.log(`✅ 유저 매칭 성공:`);
    console.log(` 1. ${henry.name} (왼쪽 창 예상)`);
    console.log(` 2. ${azerc.name} (오른쪽 창 예상)`);

    // 2. 1:1 방 생성
    const room = await prisma.room.create({
        data: {
            type: "DIRECT",
            name: `${henry.name} & ${azerc.name}`, // 디버깅용 이름
            members: {
                create: [
                    { userId: henry.id, role: "MEMBER" },
                    { userId: azerc.id, role: "MEMBER" }
                ]
            }
        }
    });

    console.log(`\n🎉 방 생성 완료! Room ID: ${room.id}`);

    // 3. 인사 메시지 넣기
    await prisma.message.createMany({
        data: [
            {
                roomId: room.id,
                senderId: henry.id,
                content: "안녕하세요! 저는 왼쪽 창(Henry)입니다.",
                type: "TEXT"
            },
            {
                roomId: room.id,
                senderId: azerc.id,
                content: "반갑습니다! 저는 오른쪽 창(Azerc)입니다.",
                type: "TEXT"
            }
        ]
    });

    console.log("✅ 메시지 주입 완료. 이제 브라우저를 새로고침하세요.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
