import { motion } from "framer-motion";

interface TimelineItem {
    time: string;
    activity: string;
    description: string;
    location?: string;
    cost?: string;
}

interface DayPlan {
    day: number;
    theme: string;
    items: TimelineItem[];
}

interface TravelPlan {
    title: string;
    summary: string;
    totalBudget?: string;
    itinerary: DayPlan[];
}

interface TimelineViewProps {
    plan: TravelPlan;
}

export function TimelineView({ plan }: TimelineViewProps) {
    if (!plan || !plan.itinerary) return null;

    return (
        <div className="flex flex-col gap-4 w-full max-w-md bg-white/5 rounded-xl p-4 border border-white/10">
            {/* 헤더 섹션 */}
            <div className="mb-2">
                <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                <p className="text-sm text-zinc-400 mt-1">{plan.summary}</p>
                {plan.totalBudget && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        💰 예산: {plan.totalBudget}
                    </div>
                )}
            </div>

            {/* 일자별 일정 */}
            <div className="space-y-6">
                {plan.itinerary.map((day) => (
                    <div key={day.day} className="relative pl-4">
                        {/* Day Header */}
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-lg font-bold text-blue-400">Day {day.day}</span>
                            <span className="text-sm text-zinc-500 font-medium">| {day.theme}</span>
                        </div>

                        {/* 타임라인 선 */}
                        <div className="absolute left-[7px] top-8 bottom-0 w-0.5 bg-zinc-800" />

                        {/* 일정 아이템 리스트 */}
                        <div className="space-y-4">
                            {day.items.map((item, index) => (
                                <div key={index} className="relative pl-6">
                                    {/* 점 (Dot) */}
                                    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full bg-zinc-600 border-2 border-zinc-900" />

                                    {/* 카드 */}
                                    <div className="bg-zinc-800/50 rounded-lg p-3 hover:bg-zinc-800 transition-colors border border-white/5">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                                {item.time}
                                            </span>
                                            {item.cost && (
                                                <span className="text-xs text-zinc-500">{item.cost}</span>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-semibold text-white mb-0.5">{item.activity}</h4>
                                        <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
