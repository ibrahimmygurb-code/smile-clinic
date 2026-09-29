"use client";

import { usePathname, useRouter } from "next/navigation";
import { fallbackBackHref } from "@/lib/nav-links";

export default function MobileBackBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") {
    return null;
  }

  function handleBack() {
    if (pathname === "/login" || pathname === "/register") {
      router.replace("/");
      return;
    }
    const fallback = fallbackBackHref(pathname);
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  }

  return (
    <div className="mb-6 md:hidden">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/90 px-3 py-2 text-sm font-semibold text-accent shadow-sm"
        aria-label="رجوع"
      >
        <span aria-hidden className="text-base leading-none">
          →
        </span>
        رجوع
      </button>
    </div>
  );
}
