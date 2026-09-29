import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthScreen from "./AuthScreen";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(async () => ""),
    register: vi.fn(async () => ""),
  }),
}));

describe("AuthScreen — واجهة", () => {
  it("وضع login: حقول الدخول", () => {
    render(<AuthScreen mode="login" />);
    expect(screen.getByRole("heading", { name: "تسجيل الدخول" })).toBeTruthy();
    expect(screen.getByLabelText("البريد الإلكتروني أو رقم الجوال")).toBeTruthy();
    expect(screen.getByLabelText("كلمة المرور")).toBeTruthy();
    expect(screen.getByRole("button", { name: "دخول" })).toBeTruthy();
  });

  it("وضع register: البريد والجوال", () => {
    render(<AuthScreen mode="register" />);
    expect(screen.getByRole("heading", { name: "إنشاء حساب" })).toBeTruthy();
    expect(screen.getByLabelText("البريد الإلكتروني")).toBeTruthy();
    expect(screen.getByLabelText("رقم الجوال")).toBeTruthy();
    expect(screen.getByRole("button", { name: "إنشاء الحساب" })).toBeTruthy();
  });
});
