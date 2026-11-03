import { BOOKING_REASON_LABELS, BRANCH_TIME_ZONE } from "@bookmark/shared";
import { parseDateStr, type DateStr } from "./dates";

export const REASON_LABELS = BOOKING_REASON_LABELS;

const timeFormat = new Intl.DateTimeFormat("en-ZA", {
  timeZone: BRANCH_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const longDateFormat = new Intl.DateTimeFormat("en-ZA", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC", // the input is a plain calendar date, so don't shift it into another zone
});

const monthFormat = new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric", timeZone: "UTC" });

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "2026-11-02T07:00:00.000Z" -> "09:00" (branch local time) */
export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} to ${formatTime(endIso)}`;
}

/** "2026-11-02" -> "Monday, 2 November 2026" */
export function formatDateLong(date: DateStr): string {
  const { year, month, day } = parseDateStr(date);
  return longDateFormat.format(new Date(Date.UTC(year, month - 1, day)));
}

/** @param month 1-12 */
export function formatMonth(year: number, month: number): string {
  return monthFormat.format(new Date(Date.UTC(year, month - 1, 1)));
}

/** "08:00", "17:00" -> "08:00 to 17:00". Midnight closing is shown as 00:00. */
export function formatHours(opensAt: string | null, closesAt: string | null): string {
  if (!opensAt || !closesAt) return "Opening hours not available";
  return `${opensAt} to ${closesAt === "24:00" ? "00:00" : closesAt}`;
}

/** [0, 6] -> "Closed Sat and Sun" */
export function formatClosedDays(days: number[]): string {
  if (days.length === 0) return "Open every day";
  const names = [...days].sort((a, b) => a - b).map((d) => WEEKDAY_SHORT[d]);
  return `Closed ${names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]}`;
}

/** The locator's addresses all end with the country, which is noise in the UI. */
export function formatAddress(address: string): string {
  return address.replace(/,\s*South Africa$/, "");
}
