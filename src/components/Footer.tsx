import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/60 bg-white/65 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-foreground">عيادة ابتسامة</p>
          <p className="mt-2 max-w-xs text-sm leading-7 text-muted">
            عيادة متخصصة في طب الأسنان العام والتجميلي، نركز على راحة المريض
            وجودة العلاج.
          </p>
        </div>

        <div>
          <p className="font-semibold text-foreground">روابط سريعة</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/services" className="hover:text-accent">
                خدمات العيادة
              </Link>
            </li>
            <li>
              <Link href="/book" className="hover:text-accent">
                حجز موعد
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-accent">
                إدارة المواعيد
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-foreground">تواصل معنا</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>📍 الرياض — حي النخيل</li>
            <li>📞 0500000000</li>
            <li>🕐 السبت — الخميس: 9 ص — 5 م</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} عيادة ابتسامة — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
