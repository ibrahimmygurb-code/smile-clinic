"use client";

import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import { clinicStats, whyUs } from "@/data/services";
import { useServices } from "@/lib/useServices";

export default function Home() {
  const { services, loading } = useServices();
  const featuredServices = services.slice(0, 3);

  return (
    <div className="space-y-16">
      <section className="dental-card overflow-hidden">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="p-8 md:p-10">
            <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              عيادة أسنان معتمدة
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground md:text-5xl">
              ابتسامة صحية
              <span className="block text-accent">تبدأ من هنا</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-muted md:text-lg">
              عيادة ابتسامة تقدم فحوصات، تنظيف، حشوات، وتبييض بأحدث التقنيات.
              احجز موعدك خلال دقائق.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/book" className="dental-btn-primary">
                احجز موعد الآن
              </Link>
              <Link href="/services" className="dental-btn-secondary">
                استعرض الخدمات
              </Link>
            </div>
          </div>

          <div className="hero-panel relative min-h-64 p-8 md:min-h-full">
            <div className="relative space-y-4">
              <div className="dental-card p-5">
                <p className="text-sm text-muted">موعدك القادم</p>
                <p className="mt-1 text-lg font-bold text-foreground">فحص دوري + تنظيف</p>
                <p className="mt-2 text-sm text-accent">الأحد — 10:30 ص</p>
              </div>
              <div className="dental-card p-5">
                <p className="text-sm text-muted">تقييم المرضى</p>
                <p className="mt-1 text-2xl font-bold text-accent">4.9 / 5</p>
                <p className="mt-1 text-sm text-muted">بناءً على +500 زيارة</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {clinicStats.map((stat) => (
          <div key={stat.label} className="dental-card p-5 text-center">
            <p className="text-3xl font-bold text-accent">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent">لماذا نحن؟</p>
            <h2 className="mt-1 text-3xl font-bold text-foreground">عناية طبية بمعايير عالية</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {whyUs.map((item) => (
            <div key={item.title} className="dental-card p-6">
              <span className="text-2xl">{item.icon}</span>
              <h3 className="mt-3 text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent">خدماتنا</p>
            <h2 className="mt-1 text-3xl font-bold text-foreground">الأكثر طلباً</h2>
          </div>
          <Link href="/services" className="text-sm font-semibold text-accent hover:underline">
            عرض كل الخدمات
          </Link>
        </div>

        {loading ? (
          <p className="text-muted">جاري تحميل الخدمات...</p>
        ) : featuredServices.length === 0 ? (
          <div className="dental-card p-6 text-center text-muted">لا توجد خدمات معروضة حالياً.</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      <section className="dental-card grid gap-6 bg-gradient-to-l from-accent-soft/60 to-white p-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground">جاهز لموعدك؟</h2>
          <p className="mt-3 leading-8 text-muted">
            احجز الآن وسيتواصل معك فريق العيادة لتأكيد الموعد.
          </p>
          <Link href="/book" className="dental-btn-primary mt-5">
            احجز موعدك
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-white/80 p-5">
          <h3 className="font-bold text-foreground">ساعات العمل</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>السبت — الخميس: 9:00 ص — 5:00 م</li>
            <li>الجمعة: مغلق</li>
            <li>العنوان: الرياض — حي النخيل</li>
            <li>الجوال: 0500000000</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
