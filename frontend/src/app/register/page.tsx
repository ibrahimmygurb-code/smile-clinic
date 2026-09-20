"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "";
  }
  return value;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="text-muted">جاري التحميل...</p>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const { register, user } = useAuth();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace(nextPath || "/");
    }
  }, [user, router, nextPath]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const message = await register(email, phone, password);
    setLoading(false);
    if (message) {
      setError(message);
      return;
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <section className="space-y-2 text-center">
        <p className="text-sm font-semibold text-accent">إنشاء حساب</p>
        <h1 className="text-3xl font-bold">حساب مريض جديد</h1>
        <p className="text-sm leading-7 text-muted">
          سجّل ببريدك ورقم جوالك وكلمة مرور لحماية حسابك.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="dental-card space-y-5 p-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="dental-input"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold">
            رقم الجوال
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="dental-input"
            placeholder="05xxxxxxxx"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="dental-input"
            placeholder="6 أحرف على الأقل"
          />
        </div>

        <button type="submit" disabled={loading} className="dental-btn-primary w-full py-3 disabled:opacity-60">
          {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        لديك حساب؟{" "}
        <Link href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"} className="font-semibold text-accent hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
