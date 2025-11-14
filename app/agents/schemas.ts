import { z } from "zod";

// 여행 일정 아이템 (Activity)
export const PlanItemSchema = z.object({
    time: z.string().describe("Time of the activity (e.g., '10:00 AM', 'Afternoon')"),
    activity: z.string().describe("Name of the activity or place"),
    description: z.string().describe("Brief description of what to do there"),
    location: z.string().optional().describe("Location or address"),
    cost: z.string().optional().describe("Estimated cost"),
});

// 하루 일정 (Day)
export const DayPlanSchema = z.object({
    day: z.number().describe("Day number (1, 2, 3...)"),
    theme: z.string().describe("Theme or focus of the day (e.g., 'Cultural Exploration', 'Shopping')"),
    items: z.array(PlanItemSchema).describe("List of activities for the day"),
});

// 전체 여행 계획 (Trip Plan)
export const TravelPlanSchema = z.object({
    title: z.string().describe("Catchy title for the trip plan"),
    summary: z.string().describe("Overall summary of the trip"),
    totalBudget: z.string().optional().describe("Estimated total budget"),
    itinerary: z.array(DayPlanSchema).describe("Day-by-day itinerary"),
});
