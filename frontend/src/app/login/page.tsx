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

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-muted">جاري التحميل...</p>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const { login, user } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (nextPath) {
        router.replace(nextPath);
        return;
      }
      router.replace(user.role === "admin" ? "/admin" : "/");
    }
  }, [user, router, nextPath]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const message = await login(identifier, password);
    setLoading(false);
    if (message) {
      setError(message);
      return;
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <section className="space-y-2 text-center">
        <p className="text-sm font-semibold text-accent">تسجيل الدخول</p>
        <h1 className="text-3xl font-bold">مرحباً بعودتك</h1>
        <p className="text-sm leading-7 text-muted">
          ادخل بالبريد الإلكتروني أو رقم الجوال مع كلمة المرور.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="dental-card space-y-5 p-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="identifier" className="mb-2 block text-sm font-semibold">
            البريد الإلكتروني أو رقم الجوال
          </label>
          <input
            id="identifier"
            type="text"
            required
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="dental-input"
            placeholder="البريد الإلكتروني أو 05xxxxxxxx"
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="dental-input"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading} className="dental-btn-primary w-full py-3 disabled:opacity-60">
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        ليس لديك حساب؟{" "}
        <Link href={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register"} className="font-semibold text-accent hover:underline">
          إنشاء حساب
        </Link>
      </p>
    </div>
  );
}
