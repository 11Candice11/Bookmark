import type { BranchDto, SlotDto } from "@bookmark/shared";
import { api } from "./client";

export function listBranches(): Promise<BranchDto[]> {
  return api<BranchDto[]>("/branches");
}

/** @param date YYYY-MM-DD, in branch local time */
export function getSlots(branchId: string, date: string): Promise<SlotDto[]> {
  return api<SlotDto[]>(`/branches/${encodeURIComponent(branchId)}/slots?date=${encodeURIComponent(date)}`);
}
