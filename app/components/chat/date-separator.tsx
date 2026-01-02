import { formatDateSeparator } from "~/lib/date-utils";

interface DateSeparatorProps {
    date: string | Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
    return (
        <div className="flex justify-center py-4">
            <span className="text-xs font-medium text-slate-400 dark:text-[#9db0b9] bg-gray-100 dark:bg-[#283339]/50 px-3 py-1 rounded-full">
                {formatDateSeparator(date)}
            </span>
        </div>
    );
}
