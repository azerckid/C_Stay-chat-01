import { useRef, useEffect } from "react";
import { type LoaderFunctionArgs, type ActionFunctionArgs, useLoaderData, useFetcher, useNavigate } from "react-router";
import { SafeArea, AppHeader } from "../components/layout";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { MessageBubble } from "~/components/chat/message-bubble";
import { ChatInput } from "~/components/chat/chat-input";

export async function loader({ request, params }: LoaderFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);
    const { roomId } = params;

    if (!roomId) throw new Error("Room ID Required");

    // 방 정보 및 메시지 조회
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            members: {
                include: { user: true }
            },
            messages: {
                orderBy: { createdAt: "asc" },
                include: { sender: true }
            }
        }
    });

    if (!room) throw new Response("Room Not Found", { status: 404 });

    // 권한 체크
    const isMember = room.members.some(m => m.userId === user.id);
    if (!isMember) throw new Response("Unauthorized", { status: 403 });

    // 상대방 정보 찾기
    const partner = room.members.find(m => m.userId !== user.id)?.user;

    return {
        user,
        room,
        partner,
        messages: room.messages.map(msg => ({
            ...msg,
            createdAt: msg.createdAt.toISOString()
        }))
    };
}

export async function action({ request, params }: ActionFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);
    const { roomId } = params;

    if (!roomId) return null;

    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (!content) return null;

    // 메시지 저장
    await prisma.message.create({
        data: {
            content,
            roomId,
            senderId: user.id,
            type: "TEXT"
        }
    });

    // 방 업데이트 (정렬용)
    await prisma.room.update({
        where: { id: roomId },
        data: { updatedAt: new Date() }
    });

    // TODO: Pusher Trigger Here
    // TODO: AI Response Trigger Here

    return { success: true };
}

export default function ChatRoomPage() {
    const { user, room, partner, messages } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // 새 메시지 오면 스크롤 하단으로
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, fetcher.state]);

    const handleSend = (text: string) => {
        const formData = new FormData();
        formData.append("content", text);
        fetcher.submit(formData, { method: "post" });
    };

    return (
        <SafeArea className="bg-background flex flex-col h-full">
            <AppHeader
                title={partner?.name || room.name || "Unknown"}
                showBack={true}
                onBack={() => navigate("/chat")}
            />

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
            >
                {messages.length === 0 && (
                    <div className="text-center text-white/30 text-sm py-10">
                        대화 내역이 없습니다.
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        content={msg.content}
                        isMe={msg.senderId === user.id}
                        createdAt={msg.createdAt}
                        senderName={msg.sender.name}
                        senderImage={msg.sender.image || undefined}
                        type={msg.type as any}
                    />
                ))}

                {/* Optimistic UI (전송 중일 때 미리 보여주기) */}
                {fetcher.state === "submitting" && fetcher.formData && (
                    <MessageBubble
                        content={fetcher.formData.get("content") as string}
                        isMe={true}
                        createdAt={new Date()}
                        senderName={user.name}
                        senderImage={user.image || undefined}
                    />
                )}
            </div>

            <ChatInput
                onSend={handleSend}
                isLoading={fetcher.state === "submitting"}
            />
        </SafeArea>
    );
}
