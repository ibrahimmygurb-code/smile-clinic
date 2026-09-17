"use client";

import { useEffect, useState } from "react";
import type { Booking } from "@/lib/types";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadBookings() {
    setError("");
    try {
      const response = await fetch("/api/bookings");
      const data = (await response.json()) as { bookings?: Booking[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? "تعذر تحميل المواعيد.");
        return;
      }
      setBookings(data.bookings ?? []);
    } catch {
      setError("تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  async function cancelBooking(id: string) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: "PATCH" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "تعذر إلغاء الموعد.");
        return;
      }
      await loadBookings();
    } catch {
      setError("تعذر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return <p className="text-muted">جاري تحميل المواعيد...</p>;
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="dental-card p-8 text-center text-muted">
          لا توجد مواعيد محفوظة بعد. احجز موعداً من صفحة الحجز أولاً.
        </div>
      ) : (
        <div className="overflow-x-auto dental-card">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="border-b border-border bg-accent-soft/40 text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">المريض</th>
                <th className="px-4 py-3 font-semibold">الجوال</th>
                <th className="px-4 py-3 font-semibold">الخدمة</th>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
                <th className="px-4 py-3 font-semibold">الوقت</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium text-foreground">{booking.name}</td>
                  <td className="px-4 py-3 text-muted">{booking.phone}</td>
                  <td className="px-4 py-3 text-muted">{booking.serviceName}</td>
                  <td className="px-4 py-3 text-muted">{booking.date}</td>
                  <td className="px-4 py-3 text-muted">{booking.time}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        booking.status === "confirmed"
                          ? "rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success"
                          : "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                      }
                    >
                      {booking.status === "confirmed" ? "مؤكد" : "ملغى"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {booking.status === "confirmed" ? (
                      <button
                        type="button"
                        disabled={busyId === booking.id}
                        onClick={() => cancelBooking(booking.id)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {busyId === booking.id ? "جاري الإلغاء..." : "إلغاء"}
                      </button>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
