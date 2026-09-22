import { randomUUID } from "crypto";
import { defaultDoctors } from "../data/doctors";
import { prisma } from "./prisma";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  offDates: string[];
};

export type DoctorInput = {
  name: string;
  specialty: string;
  offDates: string[];
};

function toDoctor(row: {
  id: string;
  name: string;
  specialty: string;
  offDates: string[];
}): Doctor {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    offDates: [...row.offDates].sort(),
  };
}

export function isDoctorOnLeave(doctor: Doctor, date: string) {
  return doctor.offDates.includes(date);
}

export async function seedDoctors() {
  for (const doctor of defaultDoctors) {
    await prisma.doctor.upsert({
      where: { id: doctor.id },
      create: { ...doctor, offDates: [] },
      update: {},
    });
  }
}

export async function listDoctors() {
  const doctors = await prisma.doctor.findMany({
    orderBy: [{ name: "asc" }],
  });
  return doctors.map(toDoctor);
}

export async function getDoctorById(id: string) {
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  return doctor ? toDoctor(doctor) : null;
}

export function validateDoctorInput(body: unknown) {
  if (!body || typeof body !== "object") {
    return { ok: false as const, error: "بيانات الطبيب غير صالحة." };
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const specialty = typeof input.specialty === "string" ? input.specialty.trim() : "";
  const rawOffDates = Array.isArray(input.offDates) ? input.offDates : [];
  const offDates = [
    ...new Set(
      rawOffDates.filter((value): value is string => typeof value === "string" && DATE_PATTERN.test(value)),
    ),
  ].sort();

  if (name.length < 2 || name.length > 80) {
    return { ok: false as const, error: "أدخل اسماً للطبيب من حرفين على الأقل." };
  }

  if (specialty.length < 2 || specialty.length > 80) {
    return { ok: false as const, error: "أدخل تخصصاً من حرفين على الأقل." };
  }

  if (rawOffDates.length !== offDates.length) {
    return { ok: false as const, error: "تاريخ الإجازة غير صالح." };
  }

  return { ok: true as const, data: { name, specialty, offDates } satisfies DoctorInput };
}

export async function createDoctor(input: DoctorInput) {
  const doctor = await prisma.doctor.create({
    data: {
      id: randomUUID(),
      name: input.name,
      specialty: input.specialty,
      offDates: input.offDates,
    },
  });

  return { ok: true as const, doctor: toDoctor(doctor) };
}

export async function updateDoctor(id: string, input: DoctorInput) {
  const existing = await prisma.doctor.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false as const, error: "الطبيب غير موجود." };
  }

  const doctor = await prisma.doctor.update({
    where: { id },
    data: {
      name: input.name,
      specialty: input.specialty,
      offDates: input.offDates,
    },
  });

  return { ok: true as const, doctor: toDoctor(doctor) };
}

export async function deleteDoctor(id: string) {
  const existing = await prisma.doctor.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false as const, error: "الطبيب غير موجود." };
  }

  const activeBookings = await prisma.booking.count({
    where: { doctorId: id, status: "confirmed" },
  });

  if (activeBookings > 0) {
    return {
      ok: false as const,
      error: "لا يمكن حذف الطبيب لوجود مواعيد مؤكدة مرتبطة به. ألغِ المواعيد أو انقلها أولاً.",
    };
  }

  await prisma.doctor.delete({ where: { id } });
  return { ok: true as const };
}
