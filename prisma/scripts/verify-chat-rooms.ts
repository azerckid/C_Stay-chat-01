import { prisma } from "../../app/lib/db.server";

async function main() {
    console.log("🔍 채팅방 데이터 검증 시작...\n");

    const rooms = await prisma.room.findMany({
        include: {
            members: {
                include: {
                    user: true
                }
            },
            messages: true
        }
    });

    if (rooms.length === 0) {
        console.log("❌ 생성된 채팅방이 없습니다.");
    } else {
        console.log(`✅ 총 ${rooms.length}개의 채팅방이 발견되었습니다.\n`);
        rooms.forEach((room, index) => {
            console.log(`[Room #${index + 1}] ID: ${room.id}`);
            console.log(` - 이름: ${room.name || "없음"}`);
            console.log(` - 타입: ${room.type}`);
            console.log(` - 참여자: ${room.members.map(m => m.user.name).join(", ")}`);
            console.log(` - 메시지 수: ${room.messages.length}개`);
            console.log("-----------------------------------");
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
