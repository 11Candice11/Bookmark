import type { BranchDto } from "@bookmark/shared";
import { prisma } from "../config/prisma.js";

// Only the columns the API exposes. The result matches BranchDto exactly.
const select = {
  id: true,
  name: true,
  address: true,
  province: true,
  city: true,
  latitude: true,
  longitude: true,
  primaryNumber: true,
  opensAt: true,
  closesAt: true,
  slotMinutes: true,
  closedDays: true,
} as const;

/** Branches that accept bookings, optionally limited to one province. */
export function listActive(province?: string): Promise<BranchDto[]> {
  return prisma.branch.findMany({
    where: {
      isActive: true,
      ...(province && { province: { equals: province, mode: "insensitive" } }),
    },
    select,
    orderBy: [{ province: "asc" }, { city: "asc" }, { name: "asc" }],
  });
}

export function findActiveById(id: string): Promise<BranchDto | null> {
  return prisma.branch.findFirst({ where: { id, isActive: true }, select });
}
