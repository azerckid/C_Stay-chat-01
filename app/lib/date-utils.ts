import { DateTime } from "luxon";

// 1. 메시지 시간 포맷 (예: 오후 2:30)
export function formatMessageTime(dateString: string | Date): string {
    const date = typeof dateString === "string" ? DateTime.fromISO(dateString) : DateTime.fromJSDate(dateString);
    return date.setLocale("ko").toFormat("a h:mm");
}

// 2. 날짜 구분선 포맷 (예: 2025년 12월 23일 화요일)
export function formatDateSeparator(dateString: string | Date): string {
    const date = typeof dateString === "string" ? DateTime.fromISO(dateString) : DateTime.fromJSDate(dateString);
    return date.setLocale("ko").toFormat("yyyy년 M월 d일 EEEE");
}

// 3. 같은 날짜인지 비교 (구분선 표시 여부 결정용)
export function isSameDay(dateA: string | Date, dateB: string | Date): boolean {
    const a = typeof dateA === "string" ? DateTime.fromISO(dateA) : DateTime.fromJSDate(dateA);
    const b = typeof dateB === "string" ? DateTime.fromISO(dateB) : DateTime.fromJSDate(dateB);
    return a.hasSame(b, "day");
}
