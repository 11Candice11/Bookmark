import { prisma } from "../config/prisma.js";
import type { BookingReason, Prisma } from "../generated/prisma/client.js";

const include = {
  branch: { select: { id: true, name: true, address: true, city: true, province: true, primaryNumber: true } },
} satisfies Prisma.BookingInclude;

export type BookingWithBranch = Prisma.BookingGetPayload<{ include: typeof include }>;

export interface NewBooking {
  reference: string;
  branchId: string;
  startsAt: Date;
  endsAt: Date;
  fullName: string;
  email: string;
  phone: string;
  reason: BookingReason;
  notes: string | null;
}

export function create(data: NewBooking): Promise<BookingWithBranch> {
  return prisma.booking.create({ data, include });
}

export function findByReference(reference: string): Promise<BookingWithBranch | null> {
  return prisma.booking.findUnique({ where: { reference }, include });
}
