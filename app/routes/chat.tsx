import { SafeArea, AppHeader, BottomNav } from "../components/layout";

export default function ChatPage() {
    return (
        <SafeArea className="items-center justify-center p-6 bg-background overflow-hidden relative">
            <AppHeader title="Chat" />

            {/* Decorative Blur Orb (Different color for distinction) */}
            <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-neon-green/20 rounded-full blur-[100px]" />

            <div className="z-10 text-center space-y-4">
                <h1 className="text-3xl font-bold text-glow-purple">Chat Messages</h1>
                <p className="text-muted-foreground">대화 목록이 여기에 표시됩니다.</p>
            </div>

            <BottomNav />
        </SafeArea>
    );
}
