"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { safeNextPath } from "@/lib/auth-paths";

type AuthMode = "login" | "register";

type AuthScreenProps = {
  mode: AuthMode;
};

export default function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const { login, register, user } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerHref = nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register";
  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  useEffect(() => {
    if (!user) {
      return;
    }
    if (nextPath) {
      router.replace(nextPath);
      return;
    }
    router.replace(user.role === "admin" ? "/admin" : "/");
  }, [user, router, nextPath]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const message =
      mode === "login" ? await login(identifier, password) : await register(email, phone, password);
    setLoading(false);
    if (message) {
      setError(message);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="dental-card overflow-hidden">
        <div className="hero-panel px-6 py-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-2xl text-white shadow-lg shadow-accent/25">
            🦷
          </span>
          <p className="mt-4 text-sm font-semibold text-accent">عيادة ابتسامة</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          </h1>
          <p className="mt-2 text-sm leading-7 text-muted">
            {isLogin
              ? "ادخل ببريدك أو رقم جوالك لمتابعة مواعيدك."
              : "أنشئ حساباً جديداً لتحجز موعدك بسهولة."}
          </p>
        </div>

        <div className="grid grid-cols-2 border-y border-border bg-accent-soft/40 p-1">
          <Link
            href={loginHref}
            className={`rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition ${
              isLogin ? "bg-white text-accent shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            دخول
          </Link>
          <Link
            href={registerHref}
            className={`rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition ${
              !isLogin ? "bg-white text-accent shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            إنشاء حساب
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLogin ? (
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
          ) : (
            <>
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
            </>
          )}

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={isLogin ? undefined : 6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="dental-input"
              placeholder={isLogin ? "••••••••" : "6 أحرف على الأقل"}
            />
          </div>

          <button type="submit" disabled={loading} className="dental-btn-primary w-full py-3 disabled:opacity-60">
            {loading
              ? isLogin
                ? "جاري الدخول..."
                : "جاري إنشاء الحساب..."
              : isLogin
                ? "دخول"
                : "إنشاء الحساب"}
          </button>
        </form>
      </div>
    </div>
  );
}
