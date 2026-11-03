import { Router } from "express";
import { createBookingSchema, type BookingDto, type CreateBookingInput } from "@bookmark/shared";
import { validate } from "../middleware/validate.js";
import { createBooking, getBookingByReference } from "../services/booking.service.js";

export const bookingsRouter = Router();

// POST /api/bookings
bookingsRouter.post<Record<string, never>, BookingDto, CreateBookingInput>(
  "/",
  validate(createBookingSchema, "body"),
  async (req, res) => {
    res.status(201).json(await createBooking(req.body));
  },
);

// GET /api/bookings/:reference
bookingsRouter.get<{ reference: string }, BookingDto>("/:reference", async (req, res) => {
  res.json(await getBookingByReference(req.params.reference));
});
