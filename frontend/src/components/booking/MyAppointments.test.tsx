import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MyAppointments from "./MyAppointments";
import { sampleBooking } from "@/test/sample-booking";
import * as useMyBookingsModule from "@/lib/useMyBookings";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/useMyBookings", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/useMyBookings")>();
  return {
    ...actual,
    useMyBookings: vi.fn(),
  };
});

const useMyBookings = vi.mocked(useMyBookingsModule.useMyBookings);

describe("MyAppointments — واجهة", () => {
  it("يعرض التحميل", () => {
    useMyBookings.mockReturnValue({ bookings: [], loading: true, error: "", nextUpcoming: null });
    render(<MyAppointments />);
    expect(screen.getByText("جاري تحميل مواعيدك...")).toBeTruthy();
  });

  it("يعرض رسالة عدم وجود مواعيد", () => {
    useMyBookings.mockReturnValue({ bookings: [], loading: false, error: "", nextUpcoming: null });
    render(<MyAppointments />);
    expect(screen.getByText("لا توجد مواعيد مسجّلة")).toBeTruthy();
  });

  it("يعرض قسم المواعيد القادمة والسابقة", () => {
    useMyBookings.mockReturnValue({
      bookings: [
        sampleBooking({ date: "2099-09-15", serviceName: "تنظيف" }),
        sampleBooking({ id: "b-old", date: "2020-01-10", serviceName: "فحص قديم" }),
      ],
      loading: false,
      error: "",
      nextUpcoming: null,
    });
    render(<MyAppointments />);
    expect(screen.getByText("المواعيد القادمة")).toBeTruthy();
    expect(screen.getByText("مواعيد سابقة")).toBeTruthy();
    expect(screen.getByText("تنظيف")).toBeTruthy();
    expect(screen.getByText("فحص قديم")).toBeTruthy();
  });
});
