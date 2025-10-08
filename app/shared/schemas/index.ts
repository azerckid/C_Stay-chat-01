import { z } from "zod";

/**
 * 전역 상수 및 열거형 정의
 */
export const UserStatus = z.enum(["ONLINE", "OFFLINE", "AWAY"]);
export const RoomType = z.enum(["DIRECT", "GROUP"]);
export const RoomMemberRole = z.enum(["OWNER", "ADMIN", "MEMBER"]);
export const MessageType = z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM", "AI_RESPONSE"]);
export const TodoStatus = z.enum(["PENDING", "COMPLETED", "CANCELLED"]);

/**
 * 2.1 User 스키마
 */
export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(1),
    avatarUrl: z.string().url().nullable().optional(),
    status: UserStatus.default("OFFLINE"),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;

/**
 * 2.2 Room 스키마
 */
export const roomSchema = z.object({
    id: z.string().uuid(),
    name: z.string().nullable().optional(),
    type: RoomType.default("DIRECT"),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export type Room = z.infer<typeof roomSchema>;

/**
 * 2.3 RoomMember 스키마
 */
export const roomMemberSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    roomId: z.string().uuid(),
    role: RoomMemberRole.default("MEMBER"),
    joinedAt: z.coerce.date(),
});

export type RoomMember = z.infer<typeof roomMemberSchema>;

/**
 * 2.4 Message 스키마
 */
export const messageSchema = z.object({
    id: z.string().uuid(),
    content: z.string().min(1),
    type: MessageType.default("TEXT"),
    senderId: z.string().uuid(),
    roomId: z.string().uuid(),
    createdAt: z.coerce.date(),
});

export type Message = z.infer<typeof messageSchema>;

/**
 * 2.5 AgentExecution 스키마
 */
export const agentExecutionSchema = z.object({
    id: z.string().uuid(),
    messageId: z.string().uuid(),
    agentName: z.string(),
    intent: z.string(),
    promptTokens: z.number().int().nonnegative(),
    completionTokens: z.number().int().nonnegative(),
    totalTokens: z.number().int().nonnegative(),
    rawOutput: z.string().nullable().optional(), // JSON string
    createdAt: z.coerce.date(),
});

export type AgentExecution = z.infer<typeof agentExecutionSchema>;

/**
 * 2.6 Todo 스키마
 */
export const todoSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    status: TodoStatus.default("PENDING"),
    dueDate: z.coerce.date().nullable().optional(),
    createdAt: z.coerce.date(),
});

export type Todo = z.infer<typeof todoSchema>;

/**
 * API 요청/응답을 위한 확장 스키마 예시
 */

// 메시지 전송 요청
export const sendMessageRequestSchema = z.object({
    roomId: z.string().uuid(),
    content: z.string().min(1),
    type: MessageType.optional().default("TEXT"),
});

// 채팅방 생성 요청
export const createRoomRequestSchema = z.object({
    name: z.string().optional(),
    type: RoomType.optional().default("DIRECT"),
    userIds: z.array(z.string().uuid()).min(1),
});
