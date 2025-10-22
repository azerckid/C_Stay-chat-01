import { SafeArea, AppHeader, BottomNav } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import type { Route } from "./+types/chat";

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request);
    requireAuth(session, request);
    return { user: session?.user };
}

export default function ChatPage({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;
    return (
        <SafeArea className="items-center justify-center p-6 bg-background overflow-hidden relative">
            <AppHeader title="Chat" />

            {/* Decorative Blur Orb (Different color for distinction) */}
            <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-neon-green/20 rounded-full blur-[100px]" />

            <div className="z-10 text-center space-y-4">
                <h1 className="text-3xl font-bold text-glow-purple">Hello, {user?.name}!</h1>
                <p className="text-muted-foreground">프리미엄 컨시어지 대화가 준비되었습니다.</p>
                <div className="pt-4">
                    <button
                        onClick={async () => {
                            const { authClient } = await import("~/lib/auth-client");
                            await authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => { window.location.href = "/login"; }
                                }
                            });
                        }}
                        className="text-xs text-white/20 hover:text-white/60 underline underline-offset-4"
                    >
                        로그아웃 하기
                    </button>
                </div>
            </div>

            <BottomNav />
        </SafeArea>
    );
}
