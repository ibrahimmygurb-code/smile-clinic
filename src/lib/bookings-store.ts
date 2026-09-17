import { Prisma } from "@prisma/client";
import { dentalServices } from "@/data/services";
import { prisma } from "@/lib/prisma";
import type { Booking, BookingStatus, CreateBookingInput } from "@/lib/types";

function toBooking(row: {
  id: string;
  name: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: Date;
}): Booking {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    duration: row.duration,
    price: row.price,
    date: row.date,
    time: row.time,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

function isUniqueSlotError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function listBookings() {
  const bookings = await prisma.booking.findMany({
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });
  return bookings.map(toBooking);
}

export async function getBookingById(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  return booking ? toBooking(booking) : null;
}

export async function getBookedTimes(date: string) {
  const bookings = await prisma.booking.findMany({
    where: { date, status: "confirmed" },
    select: { time: true },
  });
  return bookings.map((booking) => booking.time);
}

export async function createBooking(input: CreateBookingInput) {
  const service = dentalServices.find((item) => item.id === input.serviceId);
  if (!service) {
    return { ok: false as const, error: "الخدمة المختارة غير موجودة." };
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        name: input.name,
        phone: input.phone,
        serviceId: service.id,
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
        date: input.date,
        time: input.time,
        status: "confirmed",
      },
    });

    return { ok: true as const, booking: toBooking(booking) };
  } catch (error) {
    if (isUniqueSlotError(error)) {
      return { ok: false as const, error: "هذا الموعد محجوز مسبقاً. اختر وقتاً آخر." };
    }
    throw error;
  }
}

export async function cancelBooking(id: string) {
  const existing = await prisma.booking.findUnique({ where: { id } });

  if (!existing) {
    return { ok: false as const, error: "الموعد غير موجود." };
  }

  if (existing.status === "cancelled") {
    return { ok: false as const, error: "هذا الموعد ملغى مسبقاً." };
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: { status: "cancelled" },
  });

  return { ok: true as const, booking: toBooking(booking) };
}
