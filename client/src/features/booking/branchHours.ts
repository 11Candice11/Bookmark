import type { BranchDto } from "@bookmark/shared";
import { clockInBranchTz } from "../../lib/dates";
import { formatClockTime } from "../../lib/formatters";

export interface HoursToday {
  open: boolean;
  label: string;
}

function toMinutes(hhmm: string): number {
  const [hours = "0", minutes = "0"] = hhmm.split(":");
  return Number(hours) * 60 + Number(minutes);
}

/**
 * Describes a branch's opening hours for right now, e.g. "Open today until 5:00 PM".
 * Uses the branch's own time zone, so it is correct wherever the visitor is.
 * Returns null when the branch has no published hours.
 */
export function describeHoursToday(
  branch: Pick<BranchDto, "opensAt" | "closesAt" | "closedDays">,
  now: Date = new Date(),
): HoursToday | null {
  const { weekday, minutes } = clockInBranchTz(now);
  if (branch.closedDays.includes(weekday)) return { open: false, label: "Closed today" };
  if (!branch.opensAt || !branch.closesAt) return null;

  if (minutes < toMinutes(branch.opensAt)) {
    return { open: false, label: `Opens today at ${formatClockTime(branch.opensAt)}` };
  }
  if (minutes < toMinutes(branch.closesAt)) {
    return { open: true, label: `Open today until ${formatClockTime(branch.closesAt)}` };
  }
  return { open: false, label: "Closed for today" };
}
