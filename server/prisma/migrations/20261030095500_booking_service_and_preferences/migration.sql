-- Booking details screen (step 4 of the booking flow):
--   * "reason" now holds the service chosen on the first screen (five services) instead of
--     the four generic reasons. Generated with `prisma migrate diff`.
--     The enum swap casts existing rows to the new type, so it fails (and rolls back) if any
--     booking still holds an old value. "Booking" was empty when this was written.
--   * "email" is optional; no confirmation email is sent without one.
--   * "smsReminder" and "needsAssistance" record the two checkboxes on the details screen.

-- AlterEnum
BEGIN;
CREATE TYPE "BookingReason_new" AS ENUM ('MONEY_AND_CARDS', 'SAVINGS', 'LOANS', 'FAMILY_PROTECTION', 'ID_AND_PASSPORT');
ALTER TABLE "Booking" ALTER COLUMN "reason" TYPE "BookingReason_new" USING ("reason"::text::"BookingReason_new");
ALTER TYPE "BookingReason" RENAME TO "BookingReason_old";
ALTER TYPE "BookingReason_new" RENAME TO "BookingReason";
DROP TYPE "public"."BookingReason_old";
COMMIT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "needsAssistance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsReminder" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" DROP NOT NULL;
