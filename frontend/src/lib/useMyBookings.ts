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
      return;
    }

    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) {
          return undefined;
        }
        setLoading(true);
        return fetch(apiUrl("/api/my-bookings"), {
          headers: { ...authHeaders() },
          signal: controller.signal,
        });
      })
      .then((response) =>
        response?.json().then((data: { bookings?: Booking[]; error?: string }) => ({ response, data })),
      )
      .then((result) => {
        if (!result || controller.signal.aborted) {
          return;
        }
        const { response, data } = result;
        if (!response.ok) {
          setError(data.error ?? "تعذر تحميل المواعيد.");
          setBookings([]);
          return;
        }
        setError("");
        setBookings(data.bookings ?? []);
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError("تعذر الاتصال بالخادم.");
        setBookings([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [enabled]);

  const visibleBookings = enabled ? bookings : [];
  return {
    bookings: visibleBookings,
    loading: enabled && loading,
    error: enabled ? error : "",
    nextUpcoming: pickNextUpcomingBooking(visibleBookings),
  };
}
