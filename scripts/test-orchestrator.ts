import "dotenv/config";
import { orchestratorGraph } from "../app/agents/orchestrator/graph";
import { HumanMessage } from "@langchain/core/messages";

async function testOrchestrator() {
    console.log("🤖 Orchestrator Integration Test Starting...\n");

    const inputs = [
        "오사카 2박 3일 알짜배기 여행 일정 짜줘. 맛집 포함해서."
    ];

    for (const input of inputs) {
        console.log(`[User]: ${input}`);

        // 그래프 실행
        const result = await orchestratorGraph.invoke({
            messages: [new HumanMessage(input)],
        });

        // 결과 출력
        console.log(`[Intent]: ${result.intent}`);

        // 마지막 AI 메시지 찾기
        const lastMessage = result.messages[result.messages.length - 1];
        console.log(`[AI Answer]: ${lastMessage.content}`);
        console.log("-".repeat(50) + "\n");
    }
}

testOrchestrator();
