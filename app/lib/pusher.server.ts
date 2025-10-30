import Pusher from "pusher";

// 싱글톤 패턴으로 Pusher 인스턴스 생성
// .env 파일에 PUSHER_ 관련 변수가 설정되어 있어야 합니다.
export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID || "",
    key: process.env.PUSHER_KEY || "",
    secret: process.env.PUSHER_SECRET || "",
    cluster: process.env.PUSHER_CLUSTER || "ap3",
    useTLS: true,
});
