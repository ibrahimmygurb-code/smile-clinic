import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminDoctors from "./AdminDoctors";
import type { Doctor } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  apiUrl: (path: string) => `http://test.local${path}`,
  authHeaders: () => ({}),
}));

describe("AdminDoctors — واجهة", () => {
  it("يعرض زر إضافة طبيب", () => {
    render(
      <AdminDoctors doctors={[]} loading={false} error="" onChanged={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "إضافة طبيب" })).toBeTruthy();
  });

  it("يعرض جدول الأطباء", () => {
    const doctors: Doctor[] = [
      { id: "dr-1", name: "د. خالد", specialty: "تقويم", offDates: [], pastOffDates: [] },
    ];
    render(
      <AdminDoctors doctors={doctors} loading={false} error="" onChanged={() => {}} />,
    );
    expect(screen.getByText("د. خالد")).toBeTruthy();
    expect(screen.getByText("تقويم")).toBeTruthy();
  });
});
