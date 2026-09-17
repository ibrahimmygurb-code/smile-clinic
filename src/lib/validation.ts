import { dentalServices, timeSlots } from "@/data/services";
import type { CreateBookingInput } from "@/lib/types";

const PHONE_PATTERN = /^05\d{8}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ValidationResult =
  | { ok: true; data: CreateBookingInput }
  | { ok: false; error: string };

function todayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isFriday(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay() === 5;
}

export function validateBookingInput(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "بيانات الحجز غير صالحة." };
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.replace(/\s+/g, "") : "";
  const serviceId = typeof input.serviceId === "string" ? input.serviceId : "";
  const date = typeof input.date === "string" ? input.date : "";
  const time = typeof input.time === "string" ? input.time : "";

  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "أدخل اسماً صحيحاً من حرفين على الأقل." };
  }

  if (!PHONE_PATTERN.test(phone)) {
    return { ok: false, error: "أدخل رقم جوال سعودي بصيغة 05xxxxxxxx." };
  }

  const service = dentalServices.find((item) => item.id === serviceId);
  if (!service) {
    return { ok: false, error: "الخدمة المختارة غير موجودة." };
  }

  if (!DATE_PATTERN.test(date)) {
    return { ok: false, error: "تاريخ الموعد غير صالح." };
  }

  if (date < todayLocalDate()) {
    return { ok: false, error: "لا يمكن حجز موعد في يوم سابق." };
  }

  if (isFriday(date)) {
    return { ok: false, error: "العيادة مغلقة يوم الجمعة. اختر يوماً آخر." };
  }

  if (!timeSlots.includes(time)) {
    return { ok: false, error: "الوقت المختار غير متاح." };
  }

  return {
    ok: true,
    data: { name, phone, serviceId, date, time },
  };
}
