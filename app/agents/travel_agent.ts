import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { createSearchTool } from "./tools/search";
import { AgentState } from "./orchestrator/state";

// 1. 도구 준비
const searchTool = createSearchTool();
const tools = [searchTool];

// 2. 모델 준비
const llm = new ChatOpenAI({
    model: "gpt-4o-mini", // 또는 성능을 위해 gpt-4 사용 가능
    temperature: 0.5,
});

// 3. 여행 에이전트 생성 (ReAct 방식)
// 시스템 프롬프트: 여행 전문가 페르소나 부여
const systemMessage = `You are "STAYnC Concierge", a professional travel assistant.
Your goal is to help users plan their trips by providing accurate and up-to-date information.
You have access to a real-time internet search tool. Use it whenever you need to find flight prices, hotel recommendations, weather, or local attractions.

- Always answer in the same language as the user (Korean).
- Provide detailed and helpful responses.
- If you don't know the answer, use the search tool.
`;

export const travelAgent = createReactAgent({
    llm,
    tools,
    messageModifier: systemMessage,
});
