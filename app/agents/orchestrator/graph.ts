import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { AgentState } from "./state";
import { SystemMessage } from "@langchain/core/messages";
import { travelAgent } from "../travel_agent";
import { chatAgent } from "../chat_agent";

// 1. 모델 초기화 (의도 분류용) 
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

// 2. 노드 정의 (Nodes)

// 의도 분류 노드
const classifyIntent = async (state: typeof AgentState.State) => {
    const systemPrompt = `You are an intent classifier.
  Classify the user's input into one of the following categories:
  - "travel_planning": If the user asks for travel recommendations, itineraries, flight/hotel info, or specific location details.
  - "general_chat": If the user says hello, asks personal questions, or chats casually.
  
  Output ONLY the category name.`;

    const messages = [
        new SystemMessage(systemPrompt),
        ...state.messages
    ];

    const response = await llm.invoke(messages);
    const intent = response.content as string;

    console.log(`[Orchestrator] Intent classified as: ${intent}`);

    return { intent };
};

// 3. 그래프 정의 (Graph)
const workflow = new StateGraph(AgentState)
    .addNode("classifyIntent", classifyIntent)
    .addNode("travel_planning", travelAgent) // 여행 에이전트
    .addNode("general_chat", chatAgent)     // 일반 대화 에이전트

    // 시작 -> 의도 분류
    .addEdge(START, "classifyIntent")

    // 분류 결과에 따른 조건부 분기 (Conditional Edge)
    .addConditionalEdges(
        "classifyIntent",
        (state) => {
            // AI가 가끔 공백이나 점을 찍을 수 있으므로 trim 처리
            const intent = (state.intent as string).trim();
            if (intent === "travel_planning" || intent === "general_chat") {
                return intent;
            }
            return "general_chat"; // 기본값
        },
        {
            travel_planning: "travel_planning",
            general_chat: "general_chat"
        }
    )

    // 각 에이전트 작업 후 종료
    .addEdge("travel_planning", END)
    .addEdge("general_chat", END);

// 4. 그래프 컴파일
export const orchestratorGraph = workflow.compile();
