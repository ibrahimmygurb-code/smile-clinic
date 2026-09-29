import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bearer, http, loginAsAdmin, loginAsPatient } from "../test/http-helpers";
import { prisma } from "./prisma";

let patientToken = "";

const validBooking = {
  name: "محمد أحمد",
  phone: "0512345678",
  doctorId: "dr-ahmed",
  serviceId: "checkup",
  date: "2099-06-01",
  time: "09:00",
};

beforeAll(async () => {
  const login = await loginAsPatient();
  expect(login.status).toBe(200);
  patientToken = login.body.token as string;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("الحجوزات — عبر POST /api/bookings", () => {
  it("بدون توكن → 401", async () => {
    const response = await http().post("/api/bookings").send(validBooking);
    expect(response.status).toBe(401);
  });

  it("جوال غير صالح → 400", async () => {
    const response = await http()
      .post("/api/bookings")
      .set(bearer(patientToken))
      .send({ ...validBooking, phone: "123" });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/جوال/);
  });

  it("يوم الجمعة → 400", async () => {
    const response = await http()
      .post("/api/bookings")
      .set(bearer(patientToken))
      .send({ ...validBooking, date: "2099-06-05" });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/الجمعة/);
  });
});

describe("تحديث الحجز — عبر PUT /api/bookings/:id", () => {
  it("جسم غير صالح → 400 قبل DB", async () => {
    const admin = await loginAsAdmin();
    expect(admin.status).toBe(200);
    const token = admin.body.token as string;
    const response = await http()
      .put("/api/bookings/non-existent-id")
      .set(bearer(token))
      .send({ ...validBooking, phone: "123" });
    expect(response.status).toBe(400);
  });
});
