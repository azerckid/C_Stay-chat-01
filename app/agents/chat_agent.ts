import { ChatOpenAI } from "@langchain/openai";
import { AgentState } from "./orchestrator/state";
import { SystemMessage, AIMessage } from "@langchain/core/messages";

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7, // 약간 창의적인 대화
});

// 단순 LLM 호출 노드
export const chatAgent = async (state: typeof AgentState.State) => {
    const systemPrompt = `You are a friendly and witty chat assistant for the "STAYnC" platform.
  Engage in casual conversation with the user.
  - Be polite, warm, and helpful.
  - Use emojis occasionally.
  - Answer in Korean.`;

    const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        ...state.messages
    ]);

    return {
        messages: [response],
    };
};
