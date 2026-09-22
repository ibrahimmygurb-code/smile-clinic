-- AlterTable
ALTER TABLE "doctors" ADD COLUMN "offDates" TEXT[] DEFAULT ARRAY[]::TEXT[];
