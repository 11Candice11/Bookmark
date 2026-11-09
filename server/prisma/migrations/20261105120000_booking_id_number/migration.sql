-- Add optional SA National ID number field so customers can look up their bookings
-- by their 13-digit government ID instead of (or in addition to) their booking reference.

ALTER TABLE "Booking" ADD COLUMN "idNumber" TEXT;

CREATE INDEX "Booking_idNumber_idx" ON "Booking"("idNumber");
