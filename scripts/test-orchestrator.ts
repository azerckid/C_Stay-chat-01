import "dotenv/config";
import { graph } from "../app/agents/orchestrator/graph";
import { HumanMessage } from "@langchain/core/messages";

async function testOrchestrator() {
    console.log("🤖 Orchestrator 테스트 시작...\n");

    const testCases = [
        "안녕, 반갑다!",
        "오늘 점심 뭐 먹지?",
        "제주도 여행 계획 짜줘",
        "부산행 비행기표 얼마야?",
        "비트코인 요즘 어때?", // 애매한 질문 (general_chat 예상)
    ];

    for (const input of testCases) {
        console.log(`👤 User: "${input}"`);

        // 그래프 실행
        const result = await graph.invoke({
            messages: [new HumanMessage(input)],
            userId: "test-user",
            userName: "Tester",
        });

        console.log(`🤖 Output Intent: ${result.intent}`);
        console.log("-----------------------------------");
    }
}

testOrchestrator().catch(console.error);
