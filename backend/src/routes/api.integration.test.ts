import { afterAll, describe, expect, it } from "vitest";
import { bearer, http, loginAsAdmin } from "../test/http-helpers";
import { prisma } from "../lib/prisma";

afterAll(async () => {
  await prisma.$disconnect();
});

describe("API — تكامل HTTP", () => {
  it("GET /api/bookings بدون توكن → 401", async () => {
    const response = await http().get("/api/bookings");
    expect(response.status).toBe(401);
  });

  it("POST /api/doctors بدون توكن → 401", async () => {
    const response = await http().post("/api/doctors").send({ name: "x", specialty: "y" });
    expect(response.status).toBe(401);
  });

  it("GET /api/doctors → قائمة أطباء", async () => {
    const response = await http().get("/api/doctors");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.doctors)).toBe(true);
  });

  it("GET /api/services → قائمة خدمات", async () => {
    const response = await http().get("/api/services");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.services)).toBe(true);
  });

  it("GET /api/health → PostgreSQL متصل", async () => {
    const response = await http().get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.database).toBe("connected");
  });

  it("GET /api/bookings كأدمن → 200", async () => {
    const login = await loginAsAdmin();
    expect(login.status).toBe(200);
    const token = login.body.token as string;
    expect(token).toBeTruthy();

    const bookings = await http().get("/api/bookings").set(bearer(token));
    expect(bookings.status).toBe(200);
    expect(Array.isArray(bookings.body.bookings)).toBe(true);
  });
});
