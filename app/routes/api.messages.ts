import { type ActionFunctionArgs } from "react-router";
import { getSession, requireAuth } from "~/lib/auth.server";
import { prisma } from "~/lib/db.server";
import { pusherServer } from "~/lib/pusher.server";
import { getAgentByEmail, AI_AGENTS } from "~/lib/ai-agents";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request);
    const user = requireAuth(session, request);
    const formData = await request.formData();

    const roomId = formData.get("roomId") as string;
    const content = formData.get("content") as string;
    const type = (formData.get("type") as string) || "TEXT";

    if (!roomId || !content) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        // 1. 유저 메시지 저장 및 Pusher 전송 (속도 최우선)
        const [userMessage, room] = await Promise.all([
            prisma.message.create({
                data: {
                    roomId,
                    senderId: user.id,
                    content,
                    type,
                    role: "user",
                    conversationId: roomId
                },
                include: {
                    sender: { select: { id: true, name: true, image: true, avatarUrl: true } }
                }
            }),
            prisma.room.findUnique({
                where: { id: roomId },
                select: {
                    members: {
                        select: { user: { select: { id: true, name: true, email: true, avatarUrl: true, image: true } } }
                    }
                }
            })
        ]);

        if (!room) return Response.json({ error: "Room not found" }, { status: 404 });

        // Pusher 비동기 전송
        pusherServer.trigger(`room-${roomId}`, "new-message", {
            ...userMessage,
            createdAt: userMessage.createdAt.toISOString()
        }).catch(e => console.error("Pusher Error:", e));

        // 2. AI 채팅 여부 확인
        const aiMember = room.members.find(m => m.user.email.endsWith("@staync.com"));
        const isAiChat = !!aiMember && user.id !== aiMember.user.id;

        if (!isAiChat) {
            return Response.json({ success: true });
        }

        // 3. AI 채팅일 경우 SSE 스트리밍 반환
        const aiUser = aiMember!.user;
        const agent = getAgentByEmail(aiUser.email);
        const streamingId = `ai-stream-${Date.now()}`;

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Typing Indicator 즉시 전송
                    pusherServer.trigger(`room-${roomId}`, "user-typing", {
                        userId: aiUser.id,
                        userName: aiUser.name || agent.name,
                        isTyping: true
                    }).catch(() => { });

                    // 대화 내역 및 지침 준비 (병렬 처리 가능하면 좋음)
                    const history = await prisma.message.findMany({
                        where: { roomId: roomId },
                        orderBy: { createdAt: "desc" },
                        take: 12, // 최신 내역 포함
                        select: { content: true, senderId: true, role: true }
                    });

                    const sortedHistory = history.reverse();

                    // 시스템 지침 구성 (미리 계산된 정보 활용)
                    const otherAgentsInfo = AI_AGENTS
                        .filter((a: any) => a.id !== agent.id)
                        .map((a: any) => `- ${a.countryCode} Expert: ${a.name} (Specialties: ${a.specialties.join(", ")})`)
                        .join("\n");

                    const systemInstructionContent = `[TECHNICAL PROTOCOL: UI_MESSAGE_STREAMING & EXPERTISE_GUARDRAIL]
[TERRITORY] Your domain is the ENTIRE country of ${agent.countryCode}.
[LANGUAGE] You MUST reply in the EXACT SAME LANGUAGE as the user (e.g., KOREAN).
[BUBBLES] Use "---" after the 1st sentence and major sections. Keep each bubble short.
[REDIRECTIONS] Only redirect if strictly about another country:
${otherAgentsInfo}

[PERSONA] ${agent.persona}
Start with a brief intro in User's Language, then "---".`;

                    // LangChain Gemini 모델 초기화
                    const model = new ChatGoogleGenerativeAI({
                        apiKey: process.env.GEMINI_API_KEY,
                        model: "gemini-2.0-flash",
                        maxOutputTokens: 1024,
                        temperature: 0.8,
                    });

                    // 메시지 히스토리 구성
                    const langchainMessages: BaseMessage[] = [
                        new SystemMessage(systemInstructionContent),
                        ...sortedHistory.map(msg =>
                            msg.senderId === aiUser.id
                                ? new AIMessage(msg.content)
                                : new HumanMessage(msg.content)
                        )
                    ];

                    // 스트리밍 실행
                    const langstream = await model.stream(langchainMessages);
                    let fullContent = "";

                    // 스트리밍 시작 신호 및 Vercel 버퍼링 방지용 Preamble 전송
                    controller.enqueue(encoder.encode(`: preamble\n${" ".repeat(2048)}\n\n`));
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: streamingId, senderId: aiUser.id, sender: { name: aiUser.name, image: aiUser.avatarUrl || aiUser.image } })}\n\n`));

                    // 1단계: AI 응답 전체 수집
                    for await (const chunk of langstream) {
                        let textChunk = "";
                        if (typeof chunk.content === "string") {
                            textChunk = chunk.content;
                        } else if (Array.isArray(chunk.content)) {
                            textChunk = chunk.content.map(c => (typeof c === "string" ? c : (c as any).text || "")).join("");
                        } else {
                            textChunk = String(chunk.content || "");
                        }
                        if (textChunk) fullContent += textChunk;
                    }

                    // 2단계: '---' 구분자로 말풍선 분할
                    const parts = fullContent.split(/\s*---\s*/).map(p => p.trim()).filter(p => p !== "");

                    // 3단계: 각 말풍선을 한 글자씩 인위적인 딜레이와 함께 전송
                    for (let i = 0; i < parts.length; i++) {
                        const part = parts[i];
                        const partId = `${streamingId}-${i}`; // 각 말풍선에 고유 ID 부여

                        // 말풍선 시작 알림 (ID 교체)
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: partId, reset: true })}\n\n`));

                        for (const char of part) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: char })}\n\n`));
                            // 자연스러운 타이핑 효과를 위한 랜덤 딜레이 (30ms ~ 70ms)
                            const delay = Math.floor(Math.random() * (70 - 30 + 1)) + 30;
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }

                        // 해당 파트 DB 저장
                        await prisma.message.create({
                            data: {
                                roomId,
                                senderId: aiUser.id,
                                content: part,
                                role: "assistant",
                                conversationId: roomId
                            }
                        });

                        // 파트 완료 신호
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ partDone: true })}\n\n`));

                        // 다음 말풍선 전 약간의 휴식 (사람이 숨 고르는 듯한 효과)
                        if (i < parts.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 400));
                        }
                    }

                    // 완료 신호 및 타이핑 중지
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                    pusherServer.trigger(`room-${roomId}`, "user-typing", { userId: aiUser.id, isTyping: false }).catch(() => { });

                    controller.close();
                } catch (error) {
                    console.error("Streaming Error:", error);
                    controller.error(error);
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Content-Type-Options": "nosniff", // 브라우저 버퍼링 방지
                "X-Accel-Buffering": "no",           // 서버 인프라(Nginx 등) 버퍼링 방지
            }
        });

    } catch (error) {
        console.error("Action Error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
