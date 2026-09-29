import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BookingForm from "./BookingForm";

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock("@/lib/useDoctors", () => ({
  useDoctors: () => ({ doctors: [], loading: false, error: "" }),
}));

vi.mock("@/lib/useServices", () => ({
  useServices: () => ({
    services: [{ id: "checkup", name: "فحص", description: "d", duration: 30, price: 100, icon: "🦷" }],
    loading: false,
    error: "",
  }),
}));

describe("BookingForm — واجهة", () => {
  it("يعرض حقول الحجز الأساسية", () => {
    render(<BookingForm />);
    expect(screen.getByLabelText("الاسم الكامل")).toBeTruthy();
    expect(screen.getByLabelText("نوع الخدمة")).toBeTruthy();
    expect(screen.getByRole("option", { name: /فحص/ })).toBeTruthy();
  });
});
