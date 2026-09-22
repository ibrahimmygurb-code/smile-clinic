import Link from "next/link";
import { ServiceIcon } from "@/lib/service-icons";
import type { Service } from "@/lib/types";

type ServiceCardProps = {
  service: Service;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="dental-card group flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <ServiceIcon icon={service.icon} size="lg" />
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          {service.duration} دقيقة
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold text-foreground">{service.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-7 text-muted">{service.description}</p>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted">السعر</p>
          <p className="text-lg font-bold text-accent">{service.price} ر.س</p>
        </div>
        <Link
          href={`/book?service=${service.id}`}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-accent-dark"
        >
          احجز الآن
        </Link>
      </div>
    </article>
  );
}
