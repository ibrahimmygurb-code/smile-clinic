"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import MyAppointments from "@/components/MyAppointments";

export default function AppointmentsGate() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);

  if (loading) {
    return <p className="text-muted">جاري التحقق من الحساب...</p>;
  }

  if (!user) {
    return (
      <div className="dental-card space-y-5 p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">مواعيدك تحتاج حساباً</h2>
        <p className="leading-8 text-muted">سجّل الدخول لعرض مواعيدك المحفوظة برقم جوال حسابك.</p>
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

  if (user.role === "admin") {
    return (
      <div className="dental-card space-y-4 p-8 text-center">
        <p className="text-lg font-bold text-foreground">هذه الصفحة للمرضى</p>
        <p className="text-sm leading-7 text-muted">لمتابعة كل الحجوزات استخدم لوحة الإدارة.</p>
        <Link href="/admin" className="dental-btn-primary inline-flex">
          لوحة الإدارة
        </Link>
      </div>
    );
  }

  return <MyAppointments />;
}
