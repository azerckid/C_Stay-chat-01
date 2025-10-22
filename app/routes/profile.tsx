import { SafeArea, AppHeader, BottomNav } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request);
    requireAuth(session, request);
    return { user: session?.user };
}

export default function ProfilePage() {
    const { user } = useLoaderData<typeof loader>();

    const handleLogout = async () => {
        toast.info("로그아웃 중입니다...");

        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("로그아웃되었습니다.");
                    window.location.href = "/login";
                },
                onError: () => {
                    toast.error("로그아웃 실패");
                }
            }
        });
    };

    return (
        <SafeArea className="bg-background">
            <AppHeader title="My Profile" showBack={false} />

            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">

                {/* 프로필 이미지 영역 */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-purple to-neon-blue p-[2px]">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-white/80">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* 정보 영역 */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                    <p className="text-white/40 text-sm">{user?.email}</p>
                </div>

                {/* 로그아웃 버튼 */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="w-full max-w-xs py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all font-medium"
                >
                    로그아웃
                </motion.button>
            </div>

            <BottomNav />
        </SafeArea>
    );
}
