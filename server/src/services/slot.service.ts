import {
  BOOKING_HORIZON_DAYS,
  MIN_NOTICE_MINUTES,
  type BranchDto,
  type SlotDto,
} from "@bookmark/shared";
import { NotFoundError } from "../errors/AppError.js";
import * as branchRepo from "../repositories/branch.repo.js";
import * as slotRepo from "../repositories/slot.repo.js";

// Branch hours are local time. Every branch is in Africa/Johannesburg, which is UTC+2 all year
// (South Africa has no daylight saving), so a fixed offset is exact.
const UTC_OFFSET_MINUTES = 120;
const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

export interface ScheduledSlot {
  startsAt: Date;
  endsAt: Date;
}

type Schedule = Pick<BranchDto, "opensAt" | "closesAt" | "slotMinutes" | "closedDays">;

/** "08:30" -> 510. "24:00" -> 1440. */
function minutesOf(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

/** The calendar date (YYYY-MM-DD) that an instant falls on in branch local time. */
export function localDateOf(instant: Date): string {
  return new Date(instant.getTime() + UTC_OFFSET_MINUTES * MS_PER_MINUTE).toISOString().slice(0, 10);
}

/**
 * Every slot a branch offers on a local calendar date, ignoring bookings and the clock.
 * Empty when the branch is closed that weekday or has no published hours.
 */
export function scheduleSlots(branch: Schedule, date: string): ScheduledSlot[] {
  if (!branch.opensAt || !branch.closesAt) return [];

  const [year, month, day] = date.split("-").map(Number);
  const localMidnightUtc = Date.UTC(year, month - 1, day) - UTC_OFFSET_MINUTES * MS_PER_MINUTE;
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  if (branch.closedDays.includes(weekday)) return [];

  const opens = minutesOf(branch.opensAt);
  const closes = minutesOf(branch.closesAt);
  const slots: ScheduledSlot[] = [];

  for (let start = opens; start + branch.slotMinutes <= closes; start += branch.slotMinutes) {
    slots.push({
      startsAt: new Date(localMidnightUtc + start * MS_PER_MINUTE),
      endsAt: new Date(localMidnightUtc + (start + branch.slotMinutes) * MS_PER_MINUTE),
    });
  }
  return slots;
}

/** True when a slot is far enough ahead, but not too far ahead, to be booked. */
export function isBookableAt(startsAt: Date, now: Date): boolean {
  const earliest = now.getTime() + MIN_NOTICE_MINUTES * MS_PER_MINUTE;
  const latest = now.getTime() + BOOKING_HORIZON_DAYS * MS_PER_DAY;
  return startsAt.getTime() >= earliest && startsAt.getTime() <= latest;
}

/** The slots for one branch on one date, each marked available or not. */
export async function getSlots(branchId: string, date: string, now = new Date()): Promise<SlotDto[]> {
  const branch = await branchRepo.findActiveById(branchId);
  if (!branch) throw new NotFoundError("Branch not found");

  const slots = scheduleSlots(branch, date);
  if (slots.length === 0) return [];

  const taken = new Set(
    await slotRepo.findConfirmedStartTimes(branchId, slots[0].startsAt, slots[slots.length - 1].endsAt),
  );

  return slots.map((slot) => ({
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    available: !taken.has(slot.startsAt.getTime()) && isBookableAt(slot.startsAt, now),
  }));
}
