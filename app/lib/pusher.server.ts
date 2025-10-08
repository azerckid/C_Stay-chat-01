import Pusher from "pusher";

/**
 * 서버 측 Pusher 인스턴스 싱글톤 관리
 * 서버 코드(Action, Loader)에서 메시지 전송(Trigger) 시 사용합니다.
 */

const globalForPusher = global as unknown as { pusher: Pusher };

export const pusherServer =
    globalForPusher.pusher ||
    new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.VITE_PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.VITE_PUSHER_CLUSTER!,
        useTLS: true,
    });

if (process.env.NODE_ENV !== "production") globalForPusher.pusher = pusherServer;
