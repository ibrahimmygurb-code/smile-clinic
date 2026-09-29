import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "./prisma";

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Prisma — قاعدة البيانات", () => {
  it("يجري استعلام SELECT 1", async () => {
    const rows = await prisma.$queryRaw<{ one: number }[]>`SELECT 1 as one`;
    expect(rows[0]?.one).toBe(1);
  });

  it("جدول doctors موجود ويُرجع صفوفاً", async () => {
    const count = await prisma.doctor.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("جدول bookings قابل للقراءة", async () => {
    const count = await prisma.booking.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
