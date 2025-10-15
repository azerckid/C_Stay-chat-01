import { auth } from "~/lib/auth";
import type { Route } from "./+types/api.auth.$";

/**
 * Better Auth의 모든 인증 요청을 처리하는 와일드카드 서버 액션입니다.
 * /api/auth/* 경로로 들어오는 GET/POST 요청을 auth.handler가 처리합니다.
 */
export async function action({ request }: Route.ActionArgs) {
    return auth.handler(request);
}

export async function loader({ request }: Route.LoaderArgs) {
    return auth.handler(request);
}
