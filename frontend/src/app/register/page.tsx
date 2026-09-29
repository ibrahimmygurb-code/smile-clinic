"use client";

import { Suspense } from "react";
import AuthScreen from "@/components/auth/AuthScreen";

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="text-muted">جاري التحميل...</p>}>
      <AuthScreen mode="register" />
    </Suspense>
  );
}
