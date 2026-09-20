"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BookingForm from "@/components/BookingForm";

type BookGateProps = {
  defaultServiceId?: string;
};

export default function BookGate({ defaultServiceId = "" }: BookGateProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const nextPath = query ? `${pathname}?${query}` : pathname;
  const next = encodeURIComponent(nextPath);

  if (loading) {
    return <p className="text-muted">جاري التحقق من الحساب...</p>;
  }

  if (!user) {
    return (
      <div className="dental-card space-y-5 p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">الحجز متاح للحسابات فقط</h2>
        <p className="leading-8 text-muted">
          يمكنك تصفح الموقع والخدمات بحرية. لإتمام الحجز سجّل الدخول أو أنشئ حساباً أولاً.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/login?next=${next}`} className="dental-btn-primary">
            تسجيل الدخول
          </Link>
          <Link href={`/register?next=${next}`} className="dental-btn-secondary">
            إنشاء حساب
          </Link>
        </div>
      </div>
    );
  }

  return <BookingForm defaultServiceId={defaultServiceId} />;
}
