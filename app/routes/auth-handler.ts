import { auth } from "~/lib/auth";
import type { Route } from "./+types/auth-handler";

/**
 * STAYnC 인증 통합 핸들러
 * 
 * AUTH_PLAN.md의 사용자 정의 콜백 경로(/auth/google/callback)와 
 * Better Auth의 내부 경로(/auth/callback/google) 사이를 중재합니다.
 */
async function handleRequest(request: Request) {
    const url = new URL(request.url);

    // 설계도 경로(/auth/google/callback)를 라이브러리 경로(/auth/callback/google)로 내부 변환
    if (url.pathname.endsWith("/google/callback")) {
        url.pathname = url.pathname.replace("/google/callback", "/callback/google");
    } else if (url.pathname.endsWith("/kakao/callback")) {
        url.pathname = url.pathname.replace("/kakao/callback", "/callback/kakao");
    }

    // 변환된 URL로 새로운 요청 객체 생성하여 핸들러에 전달
    const newRequest = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        duplex: "half",
    } as RequestInit);

    return auth.handler(newRequest);
}

export async function action({ request }: Route.ActionArgs) {
    return handleRequest(request);
}

export async function loader({ request }: Route.LoaderArgs) {
    return handleRequest(request);
}
