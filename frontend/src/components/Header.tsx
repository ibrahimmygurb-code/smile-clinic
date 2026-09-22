"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const publicNavLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/book", label: "حجز موعد" },
];

const adminNavLinks = [
  { href: "/book", label: "حجز موعد" },
  { href: "/admin", label: "لوحة الإدارة" },
  { href: "/admin/doctors", label: "إدارة الأطباء" },
  { href: "/admin/services", label: "إدارة الخدمات" },
  { href: "/admin/leaves", label: "إدارة الإجازات" },
];

export default function Header() {
  const { user, loading, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const navLinks = isAdmin ? adminNavLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-xl text-white shadow-lg shadow-accent/25">
            🦷
          </span>
          <div>
            <p className="text-base font-bold text-foreground">عيادة ابتسامة</p>
            <p className="text-xs text-muted">
              {isAdmin ? "لوحة الإدارة" : "لطب الأسنان والتجميل"}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:bg-accent-soft hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-xs text-muted sm:block">
                {user.email}
              </span>
              <button type="button" onClick={logout} className="dental-btn-secondary text-sm">
                خروج
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="dental-btn-secondary text-sm">
                دخول
              </Link>
              <Link href="/register" className="dental-btn-primary text-sm">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
