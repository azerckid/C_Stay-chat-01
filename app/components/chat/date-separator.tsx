import { formatDateSeparator } from "~/lib/date-utils";

interface DateSeparatorProps {
    date: string | Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
    return (
        <div className="flex justify-center my-6">
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/40 tracking-wide">
                    {formatDateSeparator(date)}
                </span>
            </div>
        </div>
    );
}
