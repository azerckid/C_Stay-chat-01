import { auth } from "~/lib/auth";
import type { Route } from "./+types/callback";

/**
 * Google OAuth Callback Handler
 * AUTH_PLAN.md: http://localhost:5173/auth/google/callback
 */
export async function action({ request }: Route.ActionArgs) {
    return auth.handler(request);
}

export async function loader({ request }: Route.LoaderArgs) {
    return auth.handler(request);
}
