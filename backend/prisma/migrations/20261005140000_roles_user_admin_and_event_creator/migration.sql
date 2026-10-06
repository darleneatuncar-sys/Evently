-- Rename Event.organizerId -> creatorId (preserve data)
ALTER TABLE "Event" RENAME COLUMN "organizerId" TO "creatorId";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'Event' AND indexname = 'Event_organizerId_idx'
  ) THEN
    ALTER INDEX "Event_organizerId_idx" RENAME TO "Event_creatorId_idx";
  END IF;
END $$;

DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
    FROM pg_constraint
   WHERE conrelid = '"Event"'::regclass
     AND contype = 'f'
     AND pg_get_constraintdef(oid) ILIKE '%creatorId%';
  IF cname IS NOT NULL AND cname <> 'Event_creatorId_fkey' THEN
    EXECUTE format('ALTER TABLE "Event" RENAME CONSTRAINT %I TO %I', cname, 'Event_creatorId_fkey');
  END IF;
END $$;

-- Optional price for events (0 / null = free)
ALTER TABLE "Event" ADD COLUMN "price" DOUBLE PRECISION;

-- Role enum: ATTENDEE | ORGANIZER | ADMIN  ->  USER | ADMIN
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "Role_new"
  USING (CASE WHEN "role"::text = 'ADMIN' THEN 'ADMIN' ELSE 'USER' END)::"Role_new";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
