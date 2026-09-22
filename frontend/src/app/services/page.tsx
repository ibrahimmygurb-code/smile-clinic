"use client";

import PageHeader from "@/components/PageHeader";
import ServiceCard from "@/components/ServiceCard";
import { useServices } from "@/lib/useServices";

export default function ServicesPage() {
  const { services, loading, error } = useServices();

  return (
    <div className="space-y-10">
      <PageHeader
        badge="خدمات العيادة"
        title="اختر الخدمة المناسبة لك"
        description="نوفر خدمات طب أسنان متكاملة بأسعار واضحة ومدة محددة لكل خدمة."
      />

      {loading ? (
        <p className="text-muted">جاري تحميل الخدمات...</p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : services.length === 0 ? (
        <div className="dental-card p-8 text-center text-muted">لا توجد خدمات معروضة حالياً.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
