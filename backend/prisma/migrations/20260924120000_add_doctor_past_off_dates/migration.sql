-- AlterTable
ALTER TABLE "doctors" ADD COLUMN "pastOffDates" TEXT[] DEFAULT ARRAY[]::TEXT[];
