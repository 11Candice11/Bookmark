import { Router } from "express";
import {
  createBookingSchema,
  lookupByIdNumberSchema,
  type BookingDto,
  type BookingListDto,
  type CreateBookingInput,
} from "@bookmark/shared";
import { validate } from "../middleware/validate.js";
import { createBooking, getBookingByReference, getBookingsByIdNumber } from "../services/booking.service.js";

export const bookingsRouter = Router();

// POST /api/bookings
bookingsRouter.post<Record<string, never>, BookingDto, CreateBookingInput>(
  "/",
  validate(createBookingSchema, "body"),
  async (req, res) => {
    res.status(201).json(await createBooking(req.body));
  },
);

// GET /api/bookings?idNumber=<13-digit SA ID>
// Returns all bookings for this ID number (may be empty — that is not a 404).
bookingsRouter.get<Record<string, never>, BookingListDto>(
  "/",
  validate(lookupByIdNumberSchema, "query"),
  async (req, res) => {
    res.json(await getBookingsByIdNumber(req.query.idNumber as string));
  },
);

// GET /api/bookings/:reference
bookingsRouter.get<{ reference: string }, BookingDto>("/:reference", async (req, res) => {
  res.json(await getBookingByReference(req.params.reference));
});
