import { arabicSearchMatchAny } from "@/lib/search-text";
import type { Booking } from "@/lib/types";

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function bookingMonthKey(date: string) {
  return date.slice(0, 7);
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const monthName = ARABIC_MONTHS[Number(month) - 1];
  if (!year || !monthName) {
    return monthKey;
  }
  return `${monthName} ${year}`;
}

export function groupBookingsByMonth(bookings: Booking[]) {
  const counts = new Map<string, number>();
  for (const booking of bookings) {
    const key = bookingMonthKey(booking.date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, total]) => ({ key, total, label: formatMonthLabel(key) }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export function filterBookingsForAdmin(
  bookings: Booking[],
  options: {
    monthKey?: string;
    serviceId?: string;
    doctorId?: string;
    query?: string;
  },
) {
  let list = bookings;

  if (options.monthKey) {
    list = list.filter((booking) => bookingMonthKey(booking.date) === options.monthKey);
  }

  if (options.serviceId) {
    list = list.filter((booking) => booking.serviceId === options.serviceId);
  }

  if (options.doctorId) {
    list = list.filter((booking) => booking.doctorId === options.doctorId);
  }

  const query = options.query?.trim();
  if (query) {
    list = list.filter((booking) =>
      arabicSearchMatchAny(
        [booking.name, booking.phone, booking.doctorName, booking.serviceName],
        query,
      ),
    );
  }

  return list;
}
