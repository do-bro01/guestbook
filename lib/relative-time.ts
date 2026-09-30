// "3분 전" / "어제" style labels for Written at, counted in Korean time.

const TIME_ZONE = "Asia/Seoul";
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const calendarDay = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }); // YYYY-MM-DD
const shortDate = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: TIME_ZONE,
});

export const fullDateTime = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "medium",
  timeZone: TIME_ZONE,
});

function daysApart(from: Date, to: Date): number {
  const day = (d: Date) => Date.parse(calendarDay.format(d)); // midnight UTC of that Korean date
  return Math.round((day(to) - day(from)) / (24 * HOUR));
}

export function formatRelative(date: Date, now: Date): string {
  const elapsed = now.getTime() - date.getTime();
  if (elapsed < MINUTE) return "방금 전";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}분 전`;
  if (elapsed < 24 * HOUR) return `${Math.floor(elapsed / HOUR)}시간 전`;
  const days = daysApart(date, now);
  if (days <= 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return shortDate.format(date);
}
