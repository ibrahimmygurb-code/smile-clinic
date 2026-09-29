export type NavLink = { href: string; label: string };

export const publicNavLinks: NavLink[] = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/book", label: "حجز موعد" },
  { href: "/appointments", label: "المواعيد" },
];

export const adminNavLinks: NavLink[] = [
  { href: "/book", label: "حجز موعد" },
  { href: "/admin", label: "لوحة الإدارة" },
  { href: "/admin/doctors", label: "إدارة الأطباء" },
  { href: "/admin/services", label: "إدارة الخدمات" },
  { href: "/admin/leaves", label: "إدارة الإجازات" },
];

export function fallbackBackHref(pathname: string): string {
  if (pathname === "/" || pathname === "/admin") {
    return "/";
  }
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return "/";
  }
  segments.pop();
  return `/${segments.join("/")}`;
}
