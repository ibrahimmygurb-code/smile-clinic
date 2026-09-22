"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/admin");
    }
  }, [loading, user, router]);

  if (loading) {
    return <p className="text-muted">جاري التحقق من صلاحية الدخول...</p>;
  }

  if (!user) {
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="dental-card space-y-4 p-8 text-center">
        <h1 className="text-2xl font-bold">غير مسموح</h1>
        <p className="text-muted">هذه الصفحة متاحة لحسابات العيادة فقط.</p>
        <Link href="/" className="dental-btn-primary inline-flex">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return children;
}
