import { auth } from "~/lib/auth";
import type { Route } from "./+types/callback";

/**
 * Kakao OAuth Callback Handler
 * AUTH_PLAN.md: http://localhost:5173/auth/kakao/callback
 */
export async function action({ request }: Route.ActionArgs) {
    return auth.handler(request);
}

export async function loader({ request }: Route.LoaderArgs) {
    return auth.handler(request);
}
