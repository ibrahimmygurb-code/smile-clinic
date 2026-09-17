import PageHeader from "@/components/PageHeader";
import ServiceCard from "@/components/ServiceCard";
import { dentalServices } from "@/data/services";

export default function ServicesPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        badge="خدمات العيادة"
        title="اختر الخدمة المناسبة لك"
        description="نوفر خدمات طب أسنان متكاملة بأسعار واضحة ومدة محددة لكل خدمة."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {dentalServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
