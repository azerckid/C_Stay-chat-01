import { SafeArea, BottomNav } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserIcon,
    CallIcon,
    Mail01Icon,
    ArrowRight01Icon,
    Notification03Icon,
    Moon02Icon,
    PencilEdit01Icon
} from "@hugeicons/core-free-icons";

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
        <SafeArea className="bg-[#F3F4F6] dark:bg-[#111827] flex flex-col h-screen overflow-hidden transition-colors duration-300">
            {/* Header */}
            <header className="px-6 py-4 bg-[#F3F4F6] dark:bg-[#111827] z-10 sticky top-0">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="flex flex-col items-center pt-2">
                        <h1 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB] tracking-tight">Profile</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 space-y-6">
                {/* Profile Avatar Section */}
                <div className="flex flex-col items-center pt-2 pb-4">
                    <div className="relative mb-4 group cursor-pointer">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#1F2937] shadow-sm group-hover:opacity-90 transition-opacity">
                            {user?.image ? (
                                <img src={user.image} alt={user?.name || "User"} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white uppercase">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white border-4 border-[#F3F4F6] dark:border-[#111827] shadow-sm">
                            <HugeiconsIcon icon={PencilEdit01Icon} className="w-3 h-3" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-[#111827] dark:text-[#F9FAFB]">{user?.name}</h2>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium">Travel Enthusiast</p>
                </div>

                {/* Personal Info Section */}
                <div className="space-y-3">
                    <h3 className="px-2 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Personal Info</h3>
                    <div className="bg-white dark:bg-[#1F2937] rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                        {/* Name Item */}
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                                    <HugeiconsIcon icon={UserIcon} className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Name</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{user?.name}</span>
                                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Phone Item */}
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-500">
                                    <HugeiconsIcon icon={CallIcon} className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Phone</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">+1 (555) 000-0000</span>
                                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Email Item */}
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500">
                                    <HugeiconsIcon icon={Mail01Icon} className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Email</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{user?.email}</span>
                                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="space-y-3">
                    <h3 className="px-2 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Settings</h3>
                    <div className="bg-white dark:bg-[#1F2937] rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                        {/* Notifications */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500">
                                    <HugeiconsIcon icon={Notification03Icon} className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Notifications</span>
                            </div>
                            <div className="w-11 h-6 bg-[#EF4444] rounded-full relative cursor-pointer transition-colors shadow-inner">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>

                        {/* Dark Mode */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    <HugeiconsIcon icon={Moon02Icon} className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Dark Mode</span>
                            </div>
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer transition-colors">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Log Out Button */}
                <div className="pt-2">
                    <button
                        onClick={handleLogout}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-[#1F2937] text-[#EF4444] font-semibold shadow-sm hover:bg-neutral-50 dark:hover:bg-red-900/10 active:scale-[0.98] transition-all"
                    >
                        Log Out
                    </button>
                </div>
            </main>

            <BottomNav />
        </SafeArea>
    );
}
