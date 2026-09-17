import BookingForm from "@/components/BookingForm";
import PageHeader from "@/components/PageHeader";

type BookPageProps = {
  searchParams: Promise<{
    service?: string;
  }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;
  const serviceId = params.service ?? "";

  return (
    <div className="space-y-10">
      <PageHeader
        badge="حجز موعد"
        title="احجز موعدك بسهولة"
        description="اختر الخدمة والوقت المناسب لك. سيتم حفظ الموعد في النظام ومنع حجز نفس الوقت مرتين."
      />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <BookingForm defaultServiceId={serviceId} />

        <aside className="space-y-4">
          <div className="dental-card p-6">
            <h2 className="text-lg font-bold text-foreground">ماذا يحدث بعد الحجز؟</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-muted">
              <li>1. ترسل بياناتك إلى الـ API</li>
              <li>2. يُحفظ الموعد في النظام إذا كان الوقت متاحاً</li>
              <li>3. يظهر الموعد في لوحة العيادة</li>
            </ol>
          </div>

          <div className="dental-card bg-accent-soft/40 p-6">
            <h2 className="text-lg font-bold text-foreground">نصائح قبل الزيارة</h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
              <li>• حضّر أي أشعة أو تقارير سابقة</li>
              <li>• أبلغ الطبيب عن أي حساسية دوائية</li>
              <li>• حاول الوصول قبل الموعد بـ 10 دقائق</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
