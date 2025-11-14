import { tavily } from "@tavily/core";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Tavily 검색 도구 생성 (LangChain Tool 호환)
 */
export const createSearchTool = (maxResults = 3) => {
    // 클라이언트 초기화
    const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

    return new DynamicStructuredTool({
        name: "internet_search",
        description: "Search the internet for up-to-date travel information, prices, and news.",
        schema: z.object({
            query: z.string().describe("The search query, e.g., 'Tokyo weather', 'Flight price to Osaka'"),
        }),
        func: async ({ query }) => {
            try {
                const response = await client.search(query, {
                    max_results: maxResults,
                    include_answer: true, // 간단한 요약 답변 포함
                });
                return JSON.stringify(response, null, 2);
            } catch (error) {
                console.error("Tavily Search Error:", error);
                return "Failed to retrieve search results.";
            }
        },
    });
};
