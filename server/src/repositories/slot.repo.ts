import { prisma } from "../config/prisma.js";

/** Start times (epoch ms) of confirmed bookings at a branch within [from, to). */
export async function findConfirmedStartTimes(branchId: string, from: Date, to: Date): Promise<number[]> {
  const rows = await prisma.booking.findMany({
    where: { branchId, status: "CONFIRMED", startsAt: { gte: from, lt: to } },
    select: { startsAt: true },
  });
  return rows.map((row) => row.startsAt.getTime());
}
