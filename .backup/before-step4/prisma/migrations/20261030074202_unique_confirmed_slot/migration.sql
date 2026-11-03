-- Hand-written migration (Prisma's schema language cannot express partial indexes).
--
-- Prevents double booking: a branch can have at most one CONFIRMED booking
-- for a given start time. CANCELLED bookings are excluded, so a cancelled slot
-- can be booked again.
--
-- Two concurrent inserts for the same slot race on this index; Postgres lets one
-- succeed and rejects the other with a unique violation (Prisma error P2002),
-- which the booking service should translate into SlotTakenError (HTTP 409).
CREATE UNIQUE INDEX "Booking_branchId_startsAt_confirmed_key"
ON "Booking" ("branchId", "startsAt")
WHERE "status" = 'CONFIRMED';
