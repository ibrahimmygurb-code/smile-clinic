import type { Booking } from "@/lib/types";

export function sampleBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "b-test-1",
    name: "أحمد محمد",
    phone: "0512345678",
    doctorId: "dr-ahmed",
    doctorName: "د. أحمد",
    serviceId: "checkup",
    serviceName: "فحص دوري",
    duration: 30,
    price: 150,
    date: "2026-09-15",
    time: "09:00",
    status: "confirmed",
    createdAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}
