import { describe, it, expect } from "vitest";
import type { Booking } from "@/lib/types";
import {
  bookingMonthKey,
  filterBookingsForAdmin,
  formatMonthLabel,
  groupBookingsByMonth,
} from "./admin-bookings-utils";

function sampleBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "b1",
    name: "أحمد",
    phone: "0511111111",
    doctorId: "dr-1",
    doctorName: "د. خالد",
    serviceId: "checkup",
    serviceName: "فحص",
    duration: 30,
    price: 100,
    date: "2026-09-15",
    time: "09:00",
    status: "confirmed",
    createdAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("لوحة الإدارة — الأشهر والبحث", () => {
  it("bookingMonthKey يستخرج YYYY-MM", () => {
    expect(bookingMonthKey("2026-09-24")).toBe("2026-09");
  });

  it("groupBookingsByMonth يجمع حسب الشهر", () => {
    const months = groupBookingsByMonth([
      sampleBooking({ date: "2026-09-10" }),
      sampleBooking({ id: "b2", date: "2026-09-20" }),
      sampleBooking({ id: "b3", date: "2026-10-01" }),
    ]);
    expect(months).toHaveLength(2);
    expect(months.find((m) => m.key === "2026-09")?.total).toBe(2);
    expect(formatMonthLabel("2026-09")).toContain("سبتمبر");
  });

  it("filterBookingsForAdmin يفلتر بالشهر والبحث", () => {
    const list = filterBookingsForAdmin(
      [
        sampleBooking({ name: "سارة", date: "2026-09-10" }),
        sampleBooking({ id: "b2", name: "محمد", date: "2026-10-01" }),
      ],
      { monthKey: "2026-09", query: "سار" },
    );
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe("سارة");
  });
});
