"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatAppointmentWhen, partitionBookingsByTime, useMyBookings } from "@/lib/useMyBookings";
import type { Booking } from "@/lib/types";

function statusLabel(status: Booking["status"]) {
  if (status === "confirmed") {
    return { text: "مؤكد", className: "bg-success-soft text-success" };
  }
  if (status === "cancelled") {
    return { text: "ملغى", className: "bg-red-50 text-red-600" };
  }
  return { text: "محذوف", className: "bg-zinc-100 text-zinc-600" };
}

type AppointmentCardProps = {
  booking: Booking;
  variant: "upcoming" | "past";
};

function AppointmentCard({ booking, variant }: AppointmentCardProps) {
  const status = statusLabel(booking.status);
  const isPast = variant === "past";

  return (
    <article
      className={
        isPast
          ? "rounded-2xl border border-dashed border-border bg-zinc-50/90 p-6 opacity-90"
          : "dental-card ring-1 ring-accent/15 p-6"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold ${isPast ? "text-muted" : "text-accent"}`}>
            {isPast ? "موعد سابق" : "موعد قادم"}
          </p>
          <h2
            className={`mt-1 text-xl font-bold ${isPast ? "text-muted line-through decoration-zinc-300" : "text-foreground"}`}
          >
            {booking.serviceName}
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.text}
          </span>
          {isPast && (
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
              انتهى
            </span>
          )}
        </div>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-border pb-2">
          <dt className="text-muted">الطبيب</dt>
          <dd className={isPast ? "font-medium text-muted" : "font-semibold text-foreground"}>
            {booking.doctorName}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-border pb-2">
          <dt className="text-muted">الموعد</dt>
          <dd className={isPast ? "font-medium text-muted" : "font-semibold text-foreground"}>
            {formatAppointmentWhen(booking)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-border pb-2">
          <dt className="text-muted">المدة</dt>
          <dd className={isPast ? "text-muted" : "font-semibold text-foreground"}>
            {booking.duration} دقيقة
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">السعر</dt>
          <dd className={isPast ? "text-muted" : "font-semibold text-accent"}>{booking.price} ر.س</dd>
        </div>
      </dl>
    </article>
  );
}

function AppointmentSection({
  title,
  description,
  bookings,
  variant,
}: {
  title: string;
  description: string;
  bookings: Booking[];
  variant: "upcoming" | "past";
}) {
  if (bookings.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {bookings.map((booking) => (
          <AppointmentCard key={booking.id} booking={booking} variant={variant} />
        ))}
      </div>
    </section>
  );
}

export default function MyAppointments() {
  const { bookings, loading, error } = useMyBookings(true);

  const { upcoming, past } = useMemo(() => partitionBookingsByTime(bookings), [bookings]);

  if (loading) {
    return <p className="text-muted">جاري تحميل مواعيدك...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="dental-card space-y-4 p-8 text-center">
        <p className="text-lg font-bold text-foreground">لا توجد مواعيد مسجّلة</p>
        <p className="text-sm leading-7 text-muted">
          عند الحجز برقم جوال حسابك، يظهر الموعد هنا تلقائياً.
        </p>
        <Link href="/book" className="dental-btn-primary inline-flex">
          احجز موعداً الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {upcoming.length === 0 ? (
        <div className="dental-card p-6 text-center">
          <p className="font-bold text-foreground">لا يوجد موعد قادم</p>
          <p className="mt-2 text-sm text-muted">يمكنك حجز موعد جديد في أي وقت.</p>
          <Link href="/book" className="dental-btn-primary mt-4 inline-flex">
            احجز موعداً
          </Link>
        </div>
      ) : (
        <AppointmentSection
          title="المواعيد القادمة"
          description="مواعيدك من اليوم فصاعداً — الأقرب أولاً."
          bookings={upcoming}
          variant="upcoming"
        />
      )}

      <AppointmentSection
        title="مواعيد سابقة"
        description="مواعيد انتهت مسبقاً للمراجعة فقط."
        bookings={past}
        variant="past"
      />
    </div>
  );
}
