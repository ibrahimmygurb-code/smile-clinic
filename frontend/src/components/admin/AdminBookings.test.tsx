import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import AdminBookings from "./AdminBookings";
import { sampleBooking } from "@/test/sample-booking";
import type { Doctor, Service } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  apiUrl: (path: string) => `http://test.local${path}`,
  authHeaders: () => ({ Authorization: "Bearer test" }),
}));

const doctors: Doctor[] = [
  { id: "dr-ahmed", name: "د. أحمد", specialty: "عام", offDates: [], pastOffDates: [] },
];

const services: Service[] = [
  {
    id: "checkup",
    name: "فحص",
    description: "وصف",
    duration: 30,
    price: 100,
    icon: "🦷",
  },
];

describe("AdminBookings — واجهة", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          bookings: [
            sampleBooking(),
            sampleBooking({ id: "b-2", name: "سارة", date: "2026-09-20" }),
          ],
        }),
      }),
    );
  });

  it("يعرض إحصائيات بعد تحميل الحجوزات", async () => {
    render(<AdminBookings doctors={doctors} services={services} />);
    await waitFor(() => {
      expect(screen.getByText("كل الحجوزات")).toBeTruthy();
    });
    const totalCard = screen.getByText("كل الحجوزات").closest(".dental-card");
    expect(totalCard).toBeTruthy();
    expect(within(totalCard as HTMLElement).getByText("2")).toBeTruthy();
  });

  it("يفتح نافذة الشهر مع البحث عند الضغط على شهر", async () => {
    render(<AdminBookings doctors={doctors} services={services} />);
    await waitFor(() => {
      expect(screen.getByText("الأشهر")).toBeTruthy();
    });

    const monthButton = screen.getAllByRole("button", { name: /سبتمبر 2026/i })[0];
    fireEvent.click(monthButton);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/حجوزات سبتمبر 2026/)).toBeTruthy();
    expect(within(dialog).getByLabelText("بحث في حجوزات الشهر")).toBeTruthy();
    expect(within(dialog).getByText("أحمد محمد")).toBeTruthy();
  });

  it("يفلتر حجوزات الشهر من البحث", async () => {
    render(<AdminBookings doctors={doctors} services={services} />);
    await waitFor(() => expect(screen.getByText("الأشهر")).toBeTruthy());
    fireEvent.click(screen.getAllByRole("button", { name: /سبتمبر 2026/i })[0]);

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("بحث في حجوزات الشهر"), {
      target: { value: "سارة" },
    });

    expect(within(dialog).getByText("سارة")).toBeTruthy();
    expect(within(dialog).queryByText("أحمد محمد")).toBeNull();
  });
});
