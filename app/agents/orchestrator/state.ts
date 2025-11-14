import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

// LangGraph v0.2+ 스타일의 State 정의 (Annotation 사용)
export const AgentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y), // 메시지 히스토리 누적
        default: () => [],
    }),
    userId: Annotation<string>({
        reducer: (x, y) => y ?? x, // 최신 값으로 덮어쓰기
        default: () => "",
    }),
    userName: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => "User",
    }),
    intent: Annotation<string | undefined>({
        reducer: (x, y) => y ?? x,
        default: () => undefined,
    }),
});
