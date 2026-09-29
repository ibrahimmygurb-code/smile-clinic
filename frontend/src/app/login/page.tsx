"use client";

import { Suspense } from "react";
import AuthScreen from "@/components/auth/AuthScreen";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-muted">جاري التحميل...</p>}>
      <AuthScreen mode="login" />
    </Suspense>
  );
}
