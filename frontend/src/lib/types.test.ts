import { describe, it, expect } from "vitest";
import { isDoctorOnLeave, type Doctor } from "./types";

describe("BookingForm — إجازة الطبيب", () => {
  const doctor: Doctor = {
    id: "dr-1",
    name: "د. سارة",
    specialty: "تقويم",
    offDates: ["2026-09-24"],
    pastOffDates: [],
  };

  it("isDoctorOnLeave true في يوم الإجازة", () => {
    expect(isDoctorOnLeave(doctor, "2026-09-24")).toBe(true);
  });

  it("isDoctorOnLeave false في يوم آخر", () => {
    expect(isDoctorOnLeave(doctor, "2026-09-25")).toBe(false);
  });
});
