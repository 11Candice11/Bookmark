import type { Branch } from "../../api/branches";
import { formatTime } from "../../lib/formatters";

export interface HoursToday {
  open: boolean;
  label: string;
}

function toMinutes(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

/**
 * Describes a branch's opening hours for today, e.g. "Open today until 5:00 PM".
 * Uses the browser's clock and assumes it is in the branch's time zone, because branch
 * hours are stored as plain local times. Returns null when the branch has no hours.
 */
export function describeHoursToday(
  branch: Pick<Branch, "opensAt" | "closesAt" | "closedDays">,
  now: Date,
): HoursToday | null {
  if (branch.closedDays.includes(now.getDay())) return { open: false, label: "Closed today" };
  if (!branch.opensAt || !branch.closesAt) return null;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  if (minutesNow < toMinutes(branch.opensAt)) {
    return { open: false, label: `Opens today at ${formatTime(branch.opensAt)}` };
  }
  if (minutesNow < toMinutes(branch.closesAt)) {
    return { open: true, label: `Open today until ${formatTime(branch.closesAt)}` };
  }
  return { open: false, label: "Closed for today" };
}
