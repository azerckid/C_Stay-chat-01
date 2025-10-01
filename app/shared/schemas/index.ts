import { z } from "zod";

// 예시 스키마: 추후 실제 데이터 모델로 대체 예정
export const statusSchema = z.object({
    status: z.enum(["success", "error", "loading", "idle"]),
    message: z.string().optional(),
});

export type Status = z.infer<typeof statusSchema>;
