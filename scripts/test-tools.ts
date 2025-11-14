import "dotenv/config";
import { createSearchTool } from "../app/agents/tools/search";

async function testSearchTool() {
    console.log("🔍 Tavily Search Tool Test Starting...\n");

    const searchTool = createSearchTool(3);
    const query = "오사카 유니버셜 스튜디오 입장권 가격 2024";

    console.log(`Query: "${query}"`);

    try {
        const result = await searchTool.invoke({ query });
        console.log("\n✅ Search Result:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("\n❌ Search Failed:", error);
    }
}

testSearchTool();
