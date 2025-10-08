import PusherClient from "pusher-js";

/**
 * 클라이언트 측 Pusher 인스턴스
 * 브라우저에서 채널을 구독하고 실시간 이벤트를 수신할 때 사용합니다.
 */

// 개발 환경에서 로그 활성화 (필요 시 주석 해제)
if (import.meta.env.DEV) {
    // PusherClient.logToConsole = true;
}

export const pusherClient = new PusherClient(
    import.meta.env.VITE_PUSHER_KEY as string,
    {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER as string,
        // Presence 채널이나 전용 채널 사용 시 인증 엔드포인트 설정 가능
        // userAuthentication: { endpoint: "/api/pusher/auth", transport: "ajax" },
    }
);
