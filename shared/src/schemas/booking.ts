import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Rules shared by the API and the UI                                         */
/* -------------------------------------------------------------------------- */

/** All branches are in South Africa. Branch hours and booking dates use this zone. */
export const BRANCH_TIME_ZONE = "Africa/Johannesburg";

/** A slot must start at least this many minutes from now. */
export const MIN_NOTICE_MINUTES = 60;

/** Slots can be booked at most this many days ahead. */
export const BOOKING_HORIZON_DAYS = 60;

/* -------------------------------------------------------------------------- */
/* Enums (kept in sync with server/prisma/schema.prisma)                      */
/* -------------------------------------------------------------------------- */

/** What the visit is about: the service the customer picks on the first booking screen. */
export const BOOKING_REASONS = ["MONEY_AND_CARDS", "SAVINGS", "LOANS", "FAMILY_PROTECTION", "ID_AND_PASSPORT"] as const;
export const bookingReasonSchema = z.enum(BOOKING_REASONS, { error: "Please choose a service" });
export type BookingReason = z.infer<typeof bookingReasonSchema>;

export const BOOKING_REASON_LABELS: Record<BookingReason, string> = {
  MONEY_AND_CARDS: "Money & Cards",
  SAVINGS: "Savings & Piggy Bank",
  LOANS: "Loans & Borrowing",
  FAMILY_PROTECTION: "Family Protection",
  ID_AND_PASSPORT: "Smart ID & Passport",
};

export const BOOKING_STATUSES = ["CONFIRMED", "CANCELLED"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/* -------------------------------------------------------------------------- */
/* Request schemas                                                            */
/* -------------------------------------------------------------------------- */

function isRealDate(value: string): boolean {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** A calendar date as YYYY-MM-DD (no time, no zone). */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
  .refine(isRealDate, "That is not a real calendar date");

export const listBranchesQuerySchema = z.object({
  province: z.string().trim().min(1).optional(),
});

export const slotsQuerySchema = z.object({
  date: dateStringSchema,
});

/** Query params for the GET /api/bookings?idNumber=... endpoint. */
export const lookupByIdNumberSchema = z.object({
  idNumber: z
    .string()
    .trim()
    .regex(/^\d{13}$/, "Enter a valid 13-digit South African ID number"),
});

/** The part of a booking the customer fills in. Used by the form and the API. */
export const customerDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100, "That name is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number, for example 082 123 4567"),
  /** Optional. Leave it out (do not send "") to skip the confirmation email. */
  email: z.string().trim().max(254, "That email address is too long").pipe(z.email("Enter a valid email address")).optional(),
  notes: z.string().trim().max(500, "Notes can be at most 500 characters").optional(),
  /** Asked for a text reminder before the visit. */
  smsReminder: z.boolean().default(false),
  /** Needs wheelchair ramp access or other help on arrival. */
  needsAssistance: z.boolean().default(false),
  /** South African 13-digit National ID number. Optional — stored so the customer can look up
   *  their booking by ID later. Leave it out (do not send "") to skip storing it. */
  idNumber: z
    .string()
    .trim()
    .regex(/^\d{13}$/, "Enter a valid 13-digit South African ID number")
    .optional(),
});
export type CustomerDetails = z.infer<typeof customerDetailsSchema>;

export const createBookingSchema = customerDetailsSchema.extend({
  reason: bookingReasonSchema,
  branchId: z.string().min(1, "Choose a branch"),
  /** ISO 8601 instant, e.g. 2026-11-02T08:30:00.000Z */
  startsAt: z.iso.datetime({ error: "Choose a time" }),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/* -------------------------------------------------------------------------- */
/* Response shapes                                                            */
/* -------------------------------------------------------------------------- */

export interface BranchDto {
  id: string;
  name: string;
  address: string;
  province: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  primaryNumber: string | null;
  /** 24h local time, e.g. "08:00". Null when the branch has no published hours. */
  opensAt: string | null;
  /** 24h local time, e.g. "17:00". "24:00" means midnight. */
  closesAt: string | null;
  slotMinutes: number;
  /** 0 = Sunday ... 6 = Saturday */
  closedDays: number[];
}

export interface SlotDto {
  /** ISO 8601 instants */
  startsAt: string;
  endsAt: string;
  /** False when already booked or too soon / too far ahead to book. */
  available: boolean;
}

export interface BookingDto {
  reference: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  fullName: string;
  reason: BookingReason;
  notes: string | null;
  branch: Pick<BranchDto, "id" | "name" | "address" | "city" | "province" | "primaryNumber">;
}

export interface BookingListDto {
  bookings: BookingDto[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { path: string; message: string }[];
  };
}
