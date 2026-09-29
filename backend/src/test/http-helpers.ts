import request from "supertest";
import { createApp } from "../app";

const expressApp = createApp();

/** طلب HTTP على تطبيق Express (سيرفر في الذاكرة — بدون فتح منفذ) */
export function http() {
  return request(expressApp);
}

export async function loginAsAdmin() {
  const response = await http()
    .post("/api/auth/login")
    .send({ identifier: "qayd075@gmail.com", password: "Aa1122334455" });
  return response;
}

export async function loginAsPatient() {
  const response = await http()
    .post("/api/auth/login")
    .send({ identifier: "saad@gmail.com", password: "Aa1122334455" });
  return response;
}

export function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}