import { afterAll, describe, expect, it } from "vitest";
import { http } from "../test/http-helpers";
import { prisma } from "./prisma";

afterAll(async () => {
  await prisma.$disconnect();
});

/** عبر السيرفر: POST /api/auth/login يطبّق normalizeEmail / normalizePhone */
describe("تسجيل الدخول — عبر السيرفر", () => {
  it("يقبل البريد بأحرف كبيرة وفراغات", async () => {
    const response = await http()
      .post("/api/auth/login")
      .send({ identifier: "  Saad@Gmail.COM  ", password: "Aa1122334455" });
    expect(response.status).toBe(200);
    expect(response.body.user?.email).toBe("saad@gmail.com");
  });

  it("يقبل جوال الأدمن بمسافات في identifier", async () => {
    const response = await http()
      .post("/api/auth/login")
      .send({ identifier: " 05 478 330 71 ", password: "Aa1122334455" });
    expect(response.status).toBe(200);
    expect(response.body.user?.role).toBe("admin");
  });

  it("يرفض كلمة مرور خاطئة → 401", async () => {
    const response = await http()
      .post("/api/auth/login")
      .send({ identifier: "saad@gmail.com", password: "wrong-password" });
    expect(response.status).toBe(401);
  });
});
