import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminLeaves from "./AdminLeaves";

describe("AdminLeaves — واجهة", () => {
  it("يعرض رسالة عند عدم وجود أطباء", () => {
    render(<AdminLeaves doctors={[]} loading={false} error="" onChanged={() => {}} />);
    expect(screen.getByText(/أضف طبيباً أولاً/)).toBeTruthy();
  });

  it("يعرض جدول الإجازات عند وجود أطباء", () => {
    render(
      <AdminLeaves
        loading={false}
        error=""
        onChanged={() => {}}
        doctors={[
          {
            id: "dr-1",
            name: "د. سارة",
            specialty: "تقويم",
            offDates: ["2099-01-01"],
            pastOffDates: ["2020-01-01"],
          },
        ]}
      />,
    );
    expect(screen.getByText("د. سارة")).toBeTruthy();
    expect(screen.getByText("الإجازات السابقة")).toBeTruthy();
  });
});
