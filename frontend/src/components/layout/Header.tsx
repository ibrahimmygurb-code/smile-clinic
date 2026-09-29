"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { adminNavLinks, publicNavLinks } from "@/lib/nav-links";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const navLinks = isAdmin ? adminNavLinks : publicNavLinks;
  const visibleNavLinks = user
    ? navLinks
    : navLinks.filter((link) => link.href !== "/book" && link.href !== "/appointments");
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ pathname, open: false });
  const menuOpen = menuState.pathname === pathname && menuState.open;

  function setMenuOpen(open: boolean) {
    setMenuState({ pathname, open });
  }

  function handleLogout() {
    logout();
    window.location.replace("/login");
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuState({ pathname, open: false });
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-white/90 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-main-nav"
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span
              className={`block h-0.5 w-5 rounded-full bg-foreground transition ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span className={`block h-0.5 w-5 rounded-full bg-foreground transition ${menuOpen ? "opacity-0" : ""}`} />
            <span
              className={`block h-0.5 w-5 rounded-full bg-foreground transition ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </button>

          <Link href={isAdmin ? "/admin" : "/"} className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-lg text-white shadow-lg shadow-accent/25 sm:h-11 sm:w-11 sm:text-xl">
              🦷
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground sm:text-base">عيادة ابتسامة</p>
              <p className="truncate text-[11px] text-muted sm:text-xs">
                {isAdmin ? "لوحة الإدارة" : "لطب الأسنان والتجميل"}
              </p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:bg-accent-soft hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {!loading && user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-xs text-muted lg:block">
                {user.email}
              </span>
              <button type="button" onClick={handleLogout} className="dental-btn-secondary px-3 py-2 text-xs sm:text-sm">
                خروج
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="dental-btn-secondary hidden px-3 py-2 text-xs sm:inline-flex sm:text-sm">
                دخول
              </Link>
              <Link href="/register" className="dental-btn-primary hidden px-3 py-2 text-xs sm:inline-flex sm:text-sm">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[57px] z-40 bg-black/20 md:hidden"
            aria-label="إغلاق القائمة"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="mobile-main-nav"
            className="relative z-50 border-t border-border bg-white/95 px-4 py-3 shadow-lg md:hidden"
          >
            <ul className="space-y-1">
              {visibleNavLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                        active ? "bg-accent-soft text-accent" : "text-foreground hover:bg-accent-soft/60"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {!loading && !user && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <Link href="/login" className="dental-btn-secondary text-center text-sm">
                  دخول
                </Link>
                <Link href="/register" className="dental-btn-primary text-center text-sm">
                  إنشاء حساب
                </Link>
              </div>
            )}
          </nav>
        </>
      )}
    </header>
  );
}
