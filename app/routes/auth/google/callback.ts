import { auth } from "~/lib/auth";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

/**
 * [AUTH_PLAN.md 2.1 준수] Google Callback Receiver
 * 
 * 역할: 구글이 던져준 'code'와 'state'를 받아서
 * Better Auth 엔진이 이해할 수 있는 내부 경로로 전달합니다.
 */
export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url); // 예: .../auth/google/callback?code=abc&state=xyz

    // 🚨 핵심 수정: 사용자님의 경로를 라이브러리 내부 경로로 맵핑
    // 쿼리 파라미터(code, state)는 그대로 유지됩니다.
    url.pathname = "/auth/callback/google";

    // 변환된 URL 정보를 담아 엔진에게 처리를 위임
    const libRequest = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
    });

    return auth.handler(libRequest);
}

export async function action({ request }: ActionFunctionArgs) {
    return auth.handler(request);
}
