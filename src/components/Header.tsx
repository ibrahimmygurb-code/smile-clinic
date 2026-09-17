import Link from "next/link";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/book", label: "حجز موعد" },
  { href: "/admin", label: "المواعيد" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-xl text-white shadow-lg shadow-accent/25">
            🦷
          </span>
          <div>
            <p className="text-base font-bold text-foreground">عيادة ابتسامة</p>
            <p className="text-xs text-muted">لطب الأسنان والتجميل</p>
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

        <Link href="/book" className="dental-btn-primary text-sm">
          احجز الآن
        </Link>
      </div>
    </header>
  );
}
