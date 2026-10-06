-- AlterTable Event: optional structured location data
ALTER TABLE "Event"
  ADD COLUMN "placeId" TEXT,
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION;

-- AlterTable Registration: attendee details + ticket code (added nullable first to backfill)
ALTER TABLE "Registration"
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "lastName" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "organization" TEXT,
  ADD COLUMN "ticketCode" TEXT;

-- Backfill attendee details from the related user
UPDATE "Registration" AS r
SET
  "firstName" = COALESCE(NULLIF(split_part(u."name", ' ', 1), ''), 'Asistente'),
  "lastName"  = COALESCE(NULLIF(trim(substring(u."name" from length(split_part(u."name", ' ', 1)) + 2)), ''), ''),
  "email"     = COALESCE(NULLIF(u."email", ''), 'sin-correo@evently.local'),
  "phone"     = COALESCE(r."phone", '')
FROM "User" AS u
WHERE u."id" = r."userId";

-- Fallbacks for any remaining rows without a related user
UPDATE "Registration" SET "firstName" = 'Asistente' WHERE "firstName" IS NULL;
UPDATE "Registration" SET "lastName" = '' WHERE "lastName" IS NULL;
UPDATE "Registration" SET "email" = 'sin-correo@evently.local' WHERE "email" IS NULL;
UPDATE "Registration" SET "phone" = '' WHERE "phone" IS NULL;
UPDATE "Registration"
SET "ticketCode" = 'EVT-' || upper(substr(md5(random()::text || "id"), 1, 8))
WHERE "ticketCode" IS NULL;

-- Enforce constraints
ALTER TABLE "Registration" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "Registration" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "Registration" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "Registration" ALTER COLUMN "phone" SET NOT NULL;
ALTER TABLE "Registration" ALTER COLUMN "ticketCode" SET NOT NULL;

CREATE UNIQUE INDEX "Registration_ticketCode_key" ON "Registration"("ticketCode");
