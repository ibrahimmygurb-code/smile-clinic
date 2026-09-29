import { describe, it, expect } from "vitest";
import { arabicSearchIncludes, normalizeArabicSearch } from "./search-text";

describe("بحث لوحة الإدارة — عربي", () => {
  it("normalizeArabicSearch يوحّد الألف", () => {
    expect(normalizeArabicSearch("إبراهيم")).toBe(normalizeArabicSearch("ابراهيم"));
  });

  it("arabicSearchIncludes يجد بدون تشكيل", () => {
    expect(arabicSearchIncludes("د. أحمد العتيبي", "احمد")).toBe(true);
  });
});
