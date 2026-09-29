import { randomUUID } from "crypto";
import { defaultDoctors } from "../data/doctors";
import { isValidLeaveDate, splitLeaveDates } from "./leave-dates";
import { prisma } from "./prisma";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  offDates: string[];
  pastOffDates: string[];
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
  pastOffDates: string[];
}): Doctor {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    offDates: [...row.offDates].sort(),
    pastOffDates: [...row.pastOffDates].sort(),
  };
}

async function persistArchivedLeaves(row: {
  id: string;
  name: string;
  specialty: string;
  offDates: string[];
  pastOffDates: string[];
}) {
  const archived = splitLeaveDates(row.offDates, row.pastOffDates);
  if (!archived.changed) {
    return toDoctor(row);
  }

  const updated = await prisma.doctor.update({
    where: { id: row.id },
    data: {
      offDates: archived.current,
      pastOffDates: archived.past,
    },
  });
  return toDoctor(updated);
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
  return Promise.all(doctors.map((doctor) => persistArchivedLeaves(doctor)));
}

export async function getDoctorById(id: string) {
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  return doctor ? persistArchivedLeaves(doctor) : null;
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
      rawOffDates.filter((value): value is string => typeof value === "string" && isValidLeaveDate(value)),
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
  const archived = splitLeaveDates(input.offDates, []);
  const doctor = await prisma.doctor.create({
    data: {
      id: randomUUID(),
      name: input.name,
      specialty: input.specialty,
      offDates: archived.current,
      pastOffDates: archived.past,
    },
  });

  return { ok: true as const, doctor: toDoctor(doctor) };
}

export async function updateDoctor(id: string, input: DoctorInput) {
  const existing = await prisma.doctor.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false as const, error: "الطبيب غير موجود." };
  }

  const archived = splitLeaveDates(input.offDates, existing.pastOffDates);
  const doctor = await prisma.doctor.update({
    where: { id },
    data: {
      name: input.name,
      specialty: input.specialty,
      offDates: archived.current,
      pastOffDates: archived.past,
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
