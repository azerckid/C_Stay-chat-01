import { useEffect, useRef, useState } from "react";
import Pusher, { type Channel } from "pusher-js";

// 클라이언트 사이드 싱글톤 (앱 전체에서 연결 하나만 유지)
let pusherInstance: Pusher | null = null;

function getPusherClient() {
    if (!pusherInstance && typeof window !== "undefined") {
        const apiKey = import.meta.env.VITE_PUSHER_KEY;
        const cluster = import.meta.env.VITE_PUSHER_CLUSTER || "ap3";

        // [디버깅] 키 확인 로그
        // Key check skipped for production logs

        if (!apiKey) {
            console.warn("⚠️ VITE_PUSHER_KEY is missing. Real-time features disabled.");
            return null;
        }

        // [디버깅] Pusher 내부 로그 활성화 (이게 있어야 연결 상태가 보임)
        if (import.meta.env.DEV) {
            Pusher.logToConsole = true;
        }

        try {
            pusherInstance = new Pusher(apiKey, {
                cluster: cluster,
            });
            // Instance created
        } catch (e) {
            console.error("[Pusher Debug] Create Failed ❌", e);
        }
    }
    return pusherInstance;
}

type EventHandler<T = any> = (data: T) => void;
type EventMap = Record<string, EventHandler>;

export function usePusherChannel(channelName: string, events: EventMap) {
    const channelRef = useRef<Channel | null>(null);
    const [connectionState, setConnectionState] = useState<string>("disconnected");

    useEffect(() => {
        const pusher = getPusherClient();
        if (!pusher || !channelName) return;

        // 현재 상태 설정
        setConnectionState(pusher.connection.state);

        // 상태 변경 감지
        pusher.connection.bind("state_change", (states: any) => {
            setConnectionState(states.current);
            console.log("[Pusher State]", states.current);
        });

        // 1. 구독 (Subscribe)
        // Subscribing to channel
        const channel = pusher.subscribe(channelName);
        channelRef.current = channel;

        // 2. 이벤트 바인딩 (Bind events)
        Object.entries(events).forEach(([eventName, handler]) => {
            channel.bind(eventName, handler);
        });

        // 3. 정리 (Cleanup)
        return () => {
            pusher.connection.unbind("state_change");
            Object.entries(events).forEach(([eventName, handler]) => {
                channel.unbind(eventName, handler);
            });
            pusher.unsubscribe(channelName);
            channelRef.current = null;
        };
        // 의존성 배열 주의: events 객체가 매번 새로 만들어지면 불필요한 재구독 발생.
        // 하지만 handler만 바뀌는 경우는 unbind/bind만 하는 게 효율적이나 구현이 복잡함.
        // 여기서는 channelName이 바뀔 때만 재구독하도록 하고, events는 최신 버전을 참조하도록 처리하는 게 좋음.
        // (간단 구현을 위해 일단 channelName 변경 시에만 재실행하도록 함. 심화 구현 시 stable handler 패턴 필요)
    }, [channelName /** events는 제외 */]);

    return { connectionState };
}
