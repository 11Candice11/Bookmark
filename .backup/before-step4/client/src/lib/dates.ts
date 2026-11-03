import { BRANCH_TIME_ZONE } from "@bookmark/shared";

/** A calendar date as "YYYY-MM-DD". Compares correctly as a plain string. */
export type DateStr = string;

const pad = (n: number) => String(n).padStart(2, "0");

/** @param month 1-12 */
export function toDateStr(year: number, month: number, day: number): DateStr {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseDateStr(date: DateStr) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

/** The calendar date an instant falls on in branch local time, regardless of the browser's zone. */
export function dateInBranchTz(instant: Date): DateStr {
  // The en-CA locale formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BRANCH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function todayInBranchTz(): DateStr {
  return dateInBranchTz(new Date());
}

const branchClockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: BRANCH_TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** The weekday (0 = Sunday) and minutes since midnight an instant falls on in branch local time. */
export function clockInBranchTz(instant: Date): { weekday: number; minutes: number } {
  const parts = Object.fromEntries(branchClockFormat.formatToParts(instant).map((p) => [p.type, p.value]));
  return {
    weekday: WEEKDAY_INDEX[parts.weekday ?? ""] ?? 0,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function addDays(date: DateStr, days: number): DateStr {
  const { year, month, day } = parseDateStr(date);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return toDateStr(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate());
}

/** 0 = Sunday ... 6 = Saturday */
export function weekdayOf(date: DateStr): number {
  const { year, month, day } = parseDateStr(date);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/**
 * The weeks of a month. Days outside the month are null.
 * @param month 1-12
 * @param weekStartsOn 0 = weeks start on Sunday, 1 = on Monday (the default)
 */
export function buildMonthGrid(year: number, month: number, weekStartsOn: 0 | 1 = 1): (DateStr | null)[][] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leading = (weekdayOf(toDateStr(year, month, 1)) - weekStartsOn + 7) % 7; // blanks before the 1st

  const cells: (DateStr | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateStr(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (DateStr | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
