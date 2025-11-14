import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * 모두투어 할인 항공권 조회 도구
 * API: https://b2c-api.modetour.com/CheapTicket/GetList
 * Implementation: Uses Playwright to mimic browser behavior and bypass bot detection.
 */
export const createFlightTool = () => {
    return new DynamicStructuredTool({
        name: "search_discount_flights",
        description: "Search for discount flight tickets via ModeTour. Useful for finding cheap flights. Requires arrival city code (IATA) and dates.",
        schema: z.object({
            arrivalCityCode: z.string().describe("3-letter IATA city code for arrival (e.g., NRT for Tokyo, KIX for Osaka, DAD for Da Nang)."),
            departureDate: z.string().describe("Departure date in YYYY-MM-DD format"),
            arrivalDate: z.string().describe("Return date in YYYY-MM-DD format"),
        }),
        func: async ({ arrivalCityCode, departureDate, arrivalDate }) => {
            const { chromium } = await import("playwright");
            const browser = await chromium.launch({ headless: true });

            try {
                const page = await browser.newPage();

                // 파라미터 전처리
                let destination = arrivalCityCode.toUpperCase();
                // OSA(오사카 전체)는 KIX(간사이)로 주로 매핑됨
                if (destination === "OSA") destination = "KIX";

                // 대륙 코드 매핑 (간단한 매핑 로직)
                const getContinentCode = (code: string) => {
                    const map: Record<string, string> = {
                        KIX: "JPN", NRT: "JPN", HND: "JPN", FUK: "JPN", CTS: "JPN", OKA: "JPN",
                        DAD: "ASIA", BKK: "ASIA", SGN: "ASIA", HAN: "ASIA", CXR: "ASIA", CEB: "ASIA",
                        CDG: "EUR", LHR: "EUR", FCO: "EUR", BCN: "EUR",
                        LAX: "AMCA", JFK: "AMCA", SFO: "AMCA", HNL: "AMCA",
                        SYD: "SOPA", GUM: "SOPA"
                    };
                    return map[code] || "ASIA"; // 기본값
                };

                const continentCode = getContinentCode(destination);
                const pageNum = 1;
                const itemCount = 10;
                // 출발 공항 빈값(전체 조회)으로 설정
                const departureCity = "";

                // 목표 API URL
                const api_url = `https://b2c-api.modetour.com/CheapTicket/GetList?Page=${pageNum}&ItemCount=${itemCount}&DepartureCity=${departureCity}&ContinentCode=${continentCode}&ArrivalCity=${destination}&DepartureDate=${departureDate}&ArrivalDate=${arrivalDate}`;

                console.log(`[FlightTool] Navigating to Main Page first...`);

                // 1. 메인 페이지 접속 (쿠키 및 세션 획득)
                // 봇 탐지 회피를 위해 User-Agent 설정
                await page.setExtraHTTPHeaders({
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                });

                // 실제 유저처럼 메인 페이지 방문 -> 여기서 쿠키가 구워짐
                await page.goto("https://www.modetour.com/flights/discount-flight", { waitUntil: 'domcontentloaded' });

                console.log(`[FlightTool] Fetching API data via page context...`);

                // 2. 페이지 내에서 API 호출 (Referer, Cookie 자동 해결)
                // page.evaluate를 사용하여 브라우저 컨텍스트 안에서 fetch 실행
                const data = await page.evaluate(async (url) => {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(res.statusText + " (" + res.status + ")");
                    return res.json();
                }, api_url);

                // 응답 데이터 포맷팅
                if (!data || !data.Results || data.Results.length === 0) {
                    return "No discount flights found for the given criteria.";
                }

                const flights = data.Results.map((item: any) => ({
                    airline: item.AirLineName,
                    price: `${item.TaxTotalAmount.toLocaleString()}원`,
                    departure: item.StartDt,
                    arrival: item.EndDt,
                    schedule: item.Schedule,
                    seatStatus: item.SeatStatus,
                    link: `https://www.modetour.com/flights/discount-flight`
                }));

                return JSON.stringify(flights, null, 2);

            } catch (error) {
                console.error("Flight Search Error (Playwright):", error);
                return "Failed to fetch flight information.";
            } finally {
                await browser.close();
            }
        },
    });
};
