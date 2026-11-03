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

const slotTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: BRANCH_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const appointmentDateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  timeZone: "UTC", // the input is a plain calendar date
});

const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "2026-11-02T08:00:00.000Z" -> "10:00 AM" (branch local time, as on the slot buttons) */
export function formatSlotTime(iso: string): string {
  return slotTimeFormat.format(new Date(iso));
}

/** "2026-11-13" -> "Friday, Nov 13" */
export function formatAppointmentDate(date: DateStr): string {
  const { year, month, day } = parseDateStr(date);
  return appointmentDateFormat.format(new Date(Date.UTC(year, month - 1, day)));
}

/** "17:00" -> "5:00 PM". "24:00" is how the database stores a midnight closing time. */
export function formatClockTime(hhmm: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) return hhmm;
  const hour = Number(match[1]);
  if (hour === 24 && match[2] === "00") return "midnight";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${match[2]} ${hour >= 12 && hour < 24 ? "PM" : "AM"}`;
}

/** [0, 6] -> "Saturdays and Sundays". Empty when the branch is open every day. */
export function formatClosedWeekdays(days: number[]): string {
  const names = [...days].sort((a, b) => a - b).map((d) => `${WEEKDAY_LONG[d]}s`);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** 0.4 -> "400 m", 3.24 -> "3.2 km", 118.6 -> "119 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** The locator's addresses all end with the country, which is noise in the UI. */
export function formatAddress(address: string): string {
  return address.replace(/,\s*South Africa$/, "");
}
