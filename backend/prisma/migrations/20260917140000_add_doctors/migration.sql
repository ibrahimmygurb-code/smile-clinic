-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "doctorId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "doctorName" TEXT;

-- تعيين طبيب افتراضي للمواعيد القديمة
UPDATE "bookings"
SET "doctorId" = 'dr-ahmed', "doctorName" = 'د. أحمد العتيبي'
WHERE "doctorId" IS NULL;

ALTER TABLE "bookings" ALTER COLUMN "doctorId" SET NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "doctorName" SET NOT NULL;

-- DropIndex
DROP INDEX IF EXISTS "bookings_unique_confirmed_slot";

-- CreateIndex: منع حجز نفس الوقت لنفس الطبيب
CREATE UNIQUE INDEX "bookings_unique_doctor_slot"
ON "bookings" ("doctorId", "date", "time")
WHERE status = 'confirmed';

CREATE INDEX "bookings_date_doctor_status_idx" ON "bookings"("date", "doctorId", "status");
