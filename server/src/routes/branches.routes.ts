import { Router } from "express";
import { listBranchesQuerySchema, slotsQuerySchema, type BranchDto, type SlotDto } from "@bookmark/shared";
import { validate } from "../middleware/validate.js";
import * as branchRepo from "../repositories/branch.repo.js";
import { getSlots } from "../services/slot.service.js";

export const branchesRouter = Router();

// GET /api/branches?province=Gauteng
branchesRouter.get<Record<string, never>, BranchDto[], never, { province?: string }>(
  "/",
  validate(listBranchesQuerySchema, "query"),
  async (req, res) => {
    res.json(await branchRepo.listActive(req.query.province));
  },
);

// GET /api/branches/:id/slots?date=2026-11-02
branchesRouter.get<{ id: string }, SlotDto[], never, { date: string }>(
  "/:id/slots",
  validate(slotsQuerySchema, "query"),
  async (req, res) => {
    res.json(await getSlots(req.params.id, req.query.date));
  },
);
