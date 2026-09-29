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

describe("CRUD الخدمات — عبر /api/services", () => {
  it("POST بدون توكن → 401", async () => {
    const response = await http().post("/api/services").send({
      name: "خدمة",
      description: "وصف كافٍ للاختبار.",
      duration: 30,
      price: 100,
    });
    expect(response.status).toBe(401);
  });

  it("مدة غير صالحة → 400", async () => {
    const response = await http()
      .post("/api/services")
      .set(bearer(adminToken))
      .send({
        name: "خدمة اختبار",
        description: "وصف كافٍ للاختبار هنا.",
        duration: 5,
        price: 100,
      });
    expect(response.status).toBe(400);
  });
});
