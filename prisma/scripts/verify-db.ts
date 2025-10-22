import { prisma } from "../../app/lib/db.server";

async function main() {
    console.log("🔍 DB 데이터 검증 시작...\n");

    const users = await prisma.user.findMany({
        include: {
            accounts: true,
            sessions: true,
        }
    });

    if (users.length === 0) {
        console.log("❌ 사용자 데이터가 없습니다. 로그인을 먼저 수행해 주세요.");
    } else {
        console.log(`✅ 총 ${users.length}명의 사용자가 발견되었습니다.\n`);
        users.forEach((user, index) => {
            console.log(`[User #${index + 1}]`);
            console.log(` - ID: ${user.id}`);
            console.log(` - 이름: ${user.name}`);
            console.log(` - 이메일: ${user.email}`);
            console.log(` - 이미지: ${user.image ? "있음" : "없음"}`);
            console.log(` - 소셜 연결: ${user.accounts.map(a => a.providerId).join(", ")}`);
            console.log(` - 활성 세션: ${user.sessions.length}개`);
            console.log("-----------------------------------");
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // prisma 인스턴스는 싱글톤이므로 여기서 disconnect하면 앱 전체에 영향을 줄 수 있음
        // 하지만 스크립트 실행이므로 괜찮음.
        // await prisma.$disconnect(); 
    });
