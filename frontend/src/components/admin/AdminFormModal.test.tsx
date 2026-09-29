import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AdminFormModal from "./AdminFormModal";

describe("AdminFormModal — واجهة", () => {
  it("لا يعرض المحتوى عند open=false", () => {
    render(
      <AdminFormModal open={false} title="اختبار" onClose={() => {}}>
        <p>محتوى مخفي</p>
      </AdminFormModal>,
    );
    expect(screen.queryByText("محتوى مخفي")).toBeNull();
  });

  it("يعرض العنوان والمحتوى ويغلق", () => {
    const onClose = vi.fn();
    render(
      <AdminFormModal open title="حجوزات الشهر" description="وصف" onClose={onClose}>
        <p>قائمة الحجوزات</p>
      </AdminFormModal>,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("حجوزات الشهر")).toBeTruthy();
    expect(screen.getByText("قائمة الحجوزات")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
