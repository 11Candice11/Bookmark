-- Reshape "Branch" to match the store-locator response.
-- Generated with `prisma migrate diff`, then edited by hand:
--   * "code" is renamed to "storeCode" instead of dropped and re-added.
--   * "suburb" is dropped: the locator response has no suburb field and it cannot be
--     parsed reliably out of the free-text address.
-- The new NOT NULL columns have no default, which is only valid because "Branch" is empty
-- at this point; the rows are loaded afterwards by prisma/seed.ts.

-- Rename code -> storeCode (keeps the unique index, under the name Prisma expects)
ALTER TABLE "Branch" RENAME COLUMN "code" TO "storeCode";
ALTER INDEX "Branch_code_key" RENAME TO "Branch_storeCode_key";

-- Drop suburb
DROP INDEX "Branch_suburb_idx";
ALTER TABLE "Branch" DROP COLUMN "suburb";

-- New columns from the locator response
ALTER TABLE "Branch"
  ADD COLUMN "slug" TEXT NOT NULL,
  ADD COLUMN "brand" TEXT NOT NULL,
  ADD COLUMN "primaryNumber" TEXT,
  ADD COLUMN "country" TEXT NOT NULL DEFAULT 'South Africa',
  ADD COLUMN "attributes" TEXT[],
  ADD COLUMN "tradingStatus" TEXT,
  ADD COLUMN "localPageUrl" TEXT NOT NULL,
  ADD COLUMN "googleDirectionsLink" TEXT;

-- Hours are not published for every location
ALTER TABLE "Branch"
  ALTER COLUMN "opensAt" DROP NOT NULL,
  ALTER COLUMN "closesAt" DROP NOT NULL;

CREATE UNIQUE INDEX "Branch_slug_key" ON "Branch"("slug");
