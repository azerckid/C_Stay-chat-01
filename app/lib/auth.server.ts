import { auth } from "./auth";

/**
 * 서버 사이드에서 현재 요청의 세션 정보를 가져옵니다.
 * @param request HTTP Request 객체
 * @returns 세션 정보 및 사용자 정보
 */
export async function getSession(request: Request) {
    return await auth.api.getSession({
        headers: request.headers,
    });
}

/**
 * 인증되지 않은 사용자를 로그인 페이지로 강제 이동시킵니다.
 * 인증 성공 시 다시 돌아올 수 있도록 현재 경로를 query parameter로 전달합니다.
 */
export function requireAuth(session: any, request: Request) {
    if (!session) {
        const url = new URL(request.url);
        const redirectTo = encodeURIComponent(url.pathname + url.search);
        throw new Response(null, {
            status: 302,
            headers: {
                Location: `/login?redirectTo=${redirectTo}`,
            },
        });
    }
}
