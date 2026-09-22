"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "لوحة الإدارة" },
  { href: "/admin/doctors", label: "إدارة الأطباء" },
  { href: "/admin/leaves", label: "إدارة الإجازات" },
  { href: "/book", label: "حجز موعد" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
                : "rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-muted hover:bg-accent-soft hover:text-accent"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
