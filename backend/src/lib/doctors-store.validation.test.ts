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

describe("CRUD الأطباء — عبر /api/doctors", () => {
  it("POST بدون توكن → 401", async () => {
    const response = await http()
      .post("/api/doctors")
      .send({ name: "د. test", specialty: "test", offDates: [] });
    expect(response.status).toBe(401);
  });

  it("اسم قصير → 400", async () => {
    const response = await http()
      .post("/api/doctors")
      .set(bearer(adminToken))
      .send({ name: "د", specialty: "تقويم", offDates: [] });
    expect(response.status).toBe(400);
  });

  it("تاريخ إجازة غير صالح → 400", async () => {
    const response = await http()
      .post("/api/doctors")
      .set(bearer(adminToken))
      .send({ name: "د. اختبار", specialty: "تقويم", offDates: ["15-01-2099"] });
    expect(response.status).toBe(400);
  });
});
