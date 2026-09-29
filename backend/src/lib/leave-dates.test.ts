import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bearer, http, loginAsAdmin } from "../test/http-helpers";
import { prisma } from "./prisma";

let adminToken = "";

beforeAll(async () => {
  const login = await loginAsAdmin();
  expect(login.status).toBe(200);
  adminToken = login.body.token as string;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("إجازات الأطباء — عبر السيرفر", () => {
  it("GET /api/doctors يُرجع offDates و pastOffDates", async () => {
    const response = await http().get("/api/doctors");
    expect(response.status).toBe(200);
    const doctor = response.body.doctors[0];
    expect(doctor).toHaveProperty("offDates");
    expect(doctor).toHaveProperty("pastOffDates");
    expect(Array.isArray(doctor.offDates)).toBe(true);
    expect(Array.isArray(doctor.pastOffDates)).toBe(true);
  });

  it("PUT طبيب: يوم منتهٍ يُؤرشف عند GET", async () => {
    const list = await http().get("/api/doctors");
    expect(list.status).toBe(200);
    const target = list.body.doctors[0];
    expect(target?.id).toBeTruthy();

    const put = await http()
      .put(`/api/doctors/${target.id}`)
      .set(bearer(adminToken))
      .send({
        name: target.name,
        specialty: target.specialty,
        offDates: ["2020-01-01", "2099-12-31"],
      });
    expect(put.status).toBe(200);

    const after = await http().get("/api/doctors");
    const updated = after.body.doctors.find((d: { id: string }) => d.id === target.id);
    expect(updated.offDates).toContain("2099-12-31");
    expect(updated.pastOffDates).toContain("2020-01-01");
    expect(updated.offDates).not.toContain("2020-01-01");

    await http()
      .put(`/api/doctors/${target.id}`)
      .set(bearer(adminToken))
      .send({
        name: target.name,
        specialty: target.specialty,
        offDates: target.offDates ?? [],
      });
  });

  it("PUT تاريخ إجازة غير صالح → 400", async () => {
    const list = await http().get("/api/doctors");
    expect(list.status).toBe(200);
    const target = list.body.doctors[0];
    const response = await http()
      .put(`/api/doctors/${target.id}`)
      .set(bearer(adminToken))
      .send({
        name: target.name,
        specialty: target.specialty,
        offDates: ["not-a-date"],
      });
    expect(response.status).toBe(400);
  });
});
