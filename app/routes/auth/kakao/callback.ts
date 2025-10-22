import { auth } from "~/lib/auth";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

/**
 * [AUTH_PLAN.md 2.1 준수] Kakao Callback Receiver
 */
export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url); // 예: .../auth/kakao/callback?code=abc

    // 🚨 핵심 수정: 카카오 경로 맵핑 /auth/kakao/callback -> /auth/callback/kakao
    url.pathname = "/auth/callback/kakao";

    const libRequest = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
    });

    return auth.handler(libRequest);
}

export async function action({ request }: ActionFunctionArgs) {
    return auth.handler(request);
}
