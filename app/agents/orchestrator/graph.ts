import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AgentState } from "./state";

// 1. LLM 초기화 (빠르고 저렴한 모델 사용)
const llm = new ChatOpenAI({
    model: "gpt-4o-mini", // 또는 gpt-3.5-turbo
    temperature: 0,
});

// 2. 의도 분류 노드
const classifyIntent = async (state: typeof AgentState.State) => {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];

    // 시스템 프롬프트: 의도 분류 전문가
    const systemPrompt = `You are an expert intent classifier for a travel concierge service called "STAYnC".
  Analyze the user's input and classify it into one of the following categories:
  
  - "travel_planning": The user wants to plan a trip, asks for recommendations, or asks about flights/hotels.
  - "general_chat": Casual conversation, greetings, or questions unrelated to travel planning.
  
  Respond ONLY with the category name.`;

    const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(lastMessage.content as string),
    ]);

    const intent = response.content.toString().trim().replace(/['"]/g, "") as "travel_planning" | "general_chat";

    console.log(`[Orchestrator] Classified intent: ${intent}`);

    return { intent };
};

// 3. 그래프 정의
const workflow = new StateGraph(AgentState)
    .addNode("classifyIntent", classifyIntent)
    .addEdge("__start__", "classifyIntent"); // 시작 -> 분류

// 4. 조건부 엣지 (분기 처리)
workflow.addConditionalEdges(
    "classifyIntent",
    (state) => state.intent || "general_chat",
    {
        travel_planning: END, // 추후 travelAgent 노드로 연결 예정
        general_chat: END,    // 추후 chatAgent 노드로 연결 예정
    }
);

export const graph = workflow.compile();
