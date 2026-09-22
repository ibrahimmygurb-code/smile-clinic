"use client";

import { useEffect, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api";
import type { Booking } from "@/lib/types";

function bookingSortKey(booking: Booking) {
  return `${booking.date}T${booking.time}`;
}

function appointmentTimestamp(booking: Booking) {
  return new Date(`${booking.date}T${booking.time}:00`).getTime();
}

export function isUpcomingAppointment(booking: Booking) {
  return appointmentTimestamp(booking) >= Date.now();
}

export function partitionBookingsByTime(bookings: Booking[]) {
  const upcoming: Booking[] = [];
  const past: Booking[] = [];

  for (const booking of bookings) {
    if (isUpcomingAppointment(booking)) {
      upcoming.push(booking);
    } else {
      past.push(booking);
    }
  }

  upcoming.sort((a, b) => bookingSortKey(a).localeCompare(bookingSortKey(b)));
  past.sort((a, b) => bookingSortKey(b).localeCompare(bookingSortKey(a)));

  return { upcoming, past };
}

export function pickNextUpcomingBooking(bookings: Booking[]): Booking | null {
  const { upcoming } = partitionBookingsByTime(bookings);
  const confirmed = upcoming.filter((booking) => booking.status === "confirmed");
  return confirmed[0] ?? null;
}

export function formatAppointmentWhen(booking: Booking) {
  const date = new Date(`${booking.date}T12:00:00`);
  const weekday = date.toLocaleDateString("ar-SA", { weekday: "long" });
  return `${weekday} — ${booking.time}`;
}

export function useMyBookings(enabled: boolean) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setBookings([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(apiUrl("/api/my-bookings"), {
      headers: { ...authHeaders() },
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as { bookings?: Booking[]; error?: string };
        if (!response.ok) {
          setError(data.error ?? "تعذر تحميل المواعيد.");
          setBookings([]);
          return;
        }
        setError("");
        setBookings(data.bookings ?? []);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError("تعذر الاتصال بالخادم.");
        setBookings([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [enabled]);

  return { bookings, loading, error, nextUpcoming: pickNextUpcomingBooking(bookings) };
}
