import { randomUUID } from "crypto";
import { defaultServices } from "../data/services";
import { prisma } from "./prisma";

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
};

export type ServiceInput = {
  name: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
};

function toService(row: {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
}): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    duration: row.duration,
    price: row.price,
    icon: row.icon,
  };
}

export async function seedServices() {
  for (const service of defaultServices) {
    await prisma.service.upsert({
      where: { id: service.id },
      create: service,
      update: {},
    });
  }
}

export async function listServices() {
  const services = await prisma.service.findMany({
    orderBy: [{ name: "asc" }],
  });
  return services.map(toService);
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  return service ? toService(service) : null;
}

export function validateServiceInput(body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "بيانات الخدمة غير صالحة." };
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const icon =
    typeof input.icon === "string" && input.icon.trim()
      ? input.icon.trim().slice(0, 32)
      : "🦷";
  const duration =
    typeof input.duration === "number"
      ? input.duration
      : typeof input.duration === "string"
        ? Number(input.duration)
        : NaN;
  const price =
    typeof input.price === "number"
      ? input.price
      : typeof input.price === "string"
        ? Number(input.price)
        : NaN;

  if (name.length < 2 || name.length > 80) {
    return { ok: false as const, error: "أدخل اسم خدمة من حرفين على الأقل." };
  }

  if (description.length < 5 || description.length > 300) {
    return { ok: false as const, error: "أدخل وصفاً للخدمة من 5 أحرف على الأقل." };
  }

  if (!Number.isInteger(duration) || duration < 10 || duration > 300) {
    return { ok: false as const, error: "أدخل مدة صحيحة بين 10 و 300 دقيقة." };
  }

  if (!Number.isInteger(price) || price < 0 || price > 100000) {
    return { ok: false as const, error: "أدخل سعراً صحيحاً." };
  }

  return {
    ok: true as const,
    data: { name, description, duration, price, icon } satisfies ServiceInput,
  };
}

export async function createService(input: ServiceInput) {
  const service = await prisma.service.create({
    data: {
      id: randomUUID(),
      name: input.name,
      description: input.description,
      duration: input.duration,
      price: input.price,
      icon: input.icon,
    },
  });

  return { ok: true as const, service: toService(service) };
}

export async function updateService(id: string, input: ServiceInput) {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false as const, error: "الخدمة غير موجودة." };
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      duration: input.duration,
      price: input.price,
      icon: input.icon,
    },
  });

  return { ok: true as const, service: toService(service) };
}

export async function deleteService(id: string) {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false as const, error: "الخدمة غير موجودة." };
  }

  const activeBookings = await prisma.booking.count({
    where: { serviceId: id, status: "confirmed" },
  });

  if (activeBookings > 0) {
    return {
      ok: false as const,
      error: "لا يمكن حذف الخدمة لوجود مواعيد مؤكدة مرتبطة بها.",
    };
  }

  await prisma.service.delete({ where: { id } });
  return { ok: true as const };
}
