"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { formatAppointmentWhen, useMyBookings } from "@/lib/useMyBookings";

export default function UpcomingAppointmentCard() {
  const { user, loading: authLoading } = useAuth();
  const canLoad = Boolean(user && user.role !== "admin");
  const { nextUpcoming, loading, error } = useMyBookings(canLoad);

  const showLoading = authLoading || (canLoad && loading);

  return (
    <div className="dental-card p-5">
      <p className="text-sm text-muted">موعدك القادم</p>
      {showLoading ? (
        <p className="mt-2 text-sm text-muted">جاري التحميل...</p>
      ) : !canLoad || !nextUpcoming ? (
        <>
          <p className="mt-1 text-lg font-bold text-foreground">لا يوجد حجز</p>
          <p className="mt-2 text-sm text-muted">
            {!user
              ? "سجّل الدخول واحجز موعداً ليظهر هنا."
              : error
                ? error
                : "احجز موعداً جديداً من صفحة الحجز."}
          </p>
          {!user ? (
            <Link href="/login?next=/" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
              تسجيل الدخول
            </Link>
          ) : (
            <Link href="/book" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
              احجز الآن
            </Link>
          )}
        </>
      ) : (
        <>
          <p className="mt-1 text-lg font-bold text-foreground">{nextUpcoming.serviceName}</p>
          <p className="mt-1 text-sm text-muted">مع {nextUpcoming.doctorName}</p>
          <p className="mt-2 text-sm font-semibold text-accent">{formatAppointmentWhen(nextUpcoming)}</p>
          <Link href="/appointments" className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">
            عرض كل مواعيدي
          </Link>
        </>
      )}
    </div>
  );
}
