import { auth } from "~/lib/auth";
import type { Route } from "./+types/$";

/**
 * Generic Auth Handler (sign-in, sign-out, session, etc.)
 * Treated as /auth/*
 */
export async function action({ request }: Route.ActionArgs) {
    return auth.handler(request);
}

export async function loader({ request }: Route.LoaderArgs) {
    return auth.handler(request);
}
