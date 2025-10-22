import { auth } from "~/lib/auth";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

/**
 * 일반 인증 요청 핸들러 (/auth/*)
 */
export async function action({ request }: ActionFunctionArgs) {
    return auth.handler(request);
}

export async function loader({ request }: LoaderFunctionArgs) {
    return auth.handler(request);
}
