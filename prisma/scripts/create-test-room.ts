import "dotenv/config"; // .env 파일 로드
import { prisma } from "../../app/lib/db.server";
// 환경변수 로드를 위해 필요하다면 dotenv 사용, 하지만 tsx 자동 로드 기대.
// 명시적으로 url 전달 시도


async function main() {
    console.log("🛠️ 테스트용 1:1 채팅방 생성 중...");

    // 1. 유저 2명 찾기 (없으면 생성하지 않음)
    const users = await prisma.user.findMany({ take: 2 });
    if (users.length < 2) {
        console.error("❌ 유저가 2명 미만입니다. 테스트 방을 만들 수 없습니다.");
        return;
    }

    const user1 = users[0];
    const user2 = users[1];

    console.log(` - 유저 A: ${user1.name} (${user1.email})`);
    console.log(` - 유저 B: ${user2.name} (${user2.email})`);

    // 2. 방 생성 (DIRECT)
    const room = await prisma.room.create({
        data: {
            type: "DIRECT",
            members: {
                create: [
                    { userId: user1.id, role: "MEMBER" },
                    { userId: user2.id, role: "MEMBER" }
                ]
            }
        }
    });

    console.log(`✅ 채팅방 생성 완료! Room ID: ${room.id}`);

    // 3. 대화 데이터 삽입 (왼쪽/오른쪽 테스트용)
    await prisma.message.createMany({
        data: [
            {
                roomId: room.id,
                senderId: user1.id, // 유저 A가 보냄
                content: `안녕하세요! 저는 ${user1.name}입니다.`,
                type: "TEXT"
            },
            {
                roomId: room.id,
                senderId: user2.id, // 유저 B가 보냄 (상대방)
                content: `반갑습니다 ${user1.name}님! 저는 ${user2.name}입니다.`,
                type: "TEXT"
            },
            {
                roomId: room.id,
                senderId: user1.id,
                content: "이 메시지는 오른쪽에 보여야 합니다.",
                type: "TEXT"
            },
            {
                roomId: room.id,
                senderId: user2.id,
                content: "이 메시지는 왼쪽에 보여야 합니다 (회색).",
                type: "TEXT"
            }
        ]
    });

    console.log("✅ 테스트 메시지 삽입 완료.");
    console.log(`👉 브라우저에서 /chat/${room.id} 로 접속해서 확인하세요.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
