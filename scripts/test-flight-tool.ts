import "dotenv/config";
import { createFlightTool } from "../app/agents/tools/flights";

async function testFlightTool() {
    console.log("✈️ Flight Tool Test Starting...\n");

    const flightTool = createFlightTool();

    // 테스트 데이터: 오사카(OSA), 2025년 2월 예정 (데이터가 있을 만한 날짜)
    const params = {
        arrivalCityCode: "OSA",
        departureDate: "2025-12-25",
        arrivalDate: "2026-01-24"
    };

    console.log(`Searching params: ${JSON.stringify(params)}`);

    try {
        const result = await flightTool.invoke(params);
        console.log("\n✅ Flight Search Result:");
        // 결과가 너무 길 수 있으므로 앞부분만 자르거나 파싱해서 보여줌
        console.log(result.slice(0, 1000) + (result.length > 1000 ? "...(truncated)" : ""));
    } catch (error) {
        console.error("\n❌ Flight Search Failed:", error);
    }
}

testFlightTool();
