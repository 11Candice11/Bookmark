import { randomInt } from "node:crypto";
import type { BookingDto, CreateBookingInput } from "@bookmark/shared";
import { InvalidSlotError, NotFoundError, SlotTakenError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";
import * as bookingRepo from "../repositories/booking.repo.js";
import * as branchRepo from "../repositories/branch.repo.js";
import { sendBookingConfirmation } from "./email.service.js";
import { isBookableAt, localDateOf, scheduleSlots } from "./slot.service.js";

/** Partial unique index from the `unique_confirmed_slot` migration: one CONFIRMED booking per branch and start time. */
const SLOT_INDEX = "Booking_branchId_startsAt_confirmed_key";

// No 0/O, 1/I/L so a reference is easy to read out over the phone.
const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function newReference(): string {
  let code = "";
  for (let i = 0; i < 8; i++) code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return `BM-${code}`;
}

/** For a unique-constraint error (P2002), the text describing which constraint was hit. */
function uniqueViolation(err: unknown): string | null {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") return null;
  return JSON.stringify(err.meta ?? {});
}

function toBookingDto(booking: bookingRepo.BookingWithBranch): BookingDto {
  return {
    reference: booking.reference,
    status: booking.status,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
    fullName: booking.fullName,
    reason: booking.reason,
    notes: booking.notes,
    branch: booking.branch,
  };
}

/**
 * Books a slot. Availability is not checked up front: two people can pass any read-then-write
 * check at the same moment. The database's unique index decides who wins, and the loser gets
 * a SlotTakenError (HTTP 409).
 */
export async function createBooking(input: CreateBookingInput, now = new Date()): Promise<BookingDto> {
  const branch = await branchRepo.findActiveById(input.branchId);
  if (!branch) throw new NotFoundError("Branch not found");

  // The requested time must be exactly one of the branch's slots, and bookable right now.
  const startsAt = new Date(input.startsAt);
  const slot = scheduleSlots(branch, localDateOf(startsAt)).find(
    (candidate) => candidate.startsAt.getTime() === startsAt.getTime(),
  );
  if (!slot || !isBookableAt(slot.startsAt, now)) throw new InvalidSlotError();

  // A reference collision is vanishingly unlikely, but retry rather than fail the customer.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const booking = await bookingRepo.create({
        reference: newReference(),
        branchId: branch.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        fullName: input.fullName,
        email: input.email || null,
        phone: input.phone,
        reason: input.reason,
        notes: input.notes || null,
        smsReminder: input.smsReminder,
        needsAssistance: input.needsAssistance,
      });

      const dto = toBookingDto(booking);
      // Email is optional. Without an address there is nothing to send, and the booking stands.
      if (input.email) {
        // The booking is already saved; a mail failure must not turn it into an error response.
        sendBookingConfirmation(input.email, dto).catch((err) =>
          console.error(`Could not send confirmation email for ${dto.reference}:`, err),
        );
      }
      return dto;
    } catch (err) {
      const violation = uniqueViolation(err);
      if (violation?.includes(SLOT_INDEX)) throw new SlotTakenError();
      if (violation?.includes("reference")) continue;
      throw err;
    }
  }
  throw new Error("Could not generate a unique booking reference");
}

export async function getBookingByReference(reference: string): Promise<BookingDto> {
  const booking = await bookingRepo.findByReference(reference.trim().toUpperCase());
  if (!booking) throw new NotFoundError("Booking not found");
  return toBookingDto(booking);
}
