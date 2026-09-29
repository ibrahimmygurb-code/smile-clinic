import { describe, it, expect } from "vitest";
import {
  allRegisteredLeaveDates,
  formatLeaveDayMonth,
  formatPastLeaveDuration,
} from "./leave-dates";

describe("AdminLeaves — عرض الإجازات", () => {
  it("formatPastLeaveDuration — يومان", () => {
    expect(formatPastLeaveDuration(2)).toBe("يومان");
  });

  it("formatLeaveDayMonth — يوم/شهر", () => {
    expect(formatLeaveDayMonth("2026-09-24")).toBe("24/9");
  });

  it("allRegisteredLeaveDates يدمج الماضي والحالي", () => {
    const dates = allRegisteredLeaveDates({
      offDates: ["2099-01-01"],
      pastOffDates: ["2020-01-01"],
    });
    expect(dates).toEqual(["2020-01-01", "2099-01-01"]);
  });
});
