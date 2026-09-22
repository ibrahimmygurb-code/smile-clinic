"use client";

import { useState } from "react";
import AdminGate from "@/components/AdminGate";
import AdminServices from "@/components/AdminServices";
import PageHeader from "@/components/PageHeader";
import { useServices } from "@/lib/useServices";

export default function AdminServicesPage() {
  const [servicesKey, setServicesKey] = useState(0);
  const { services, loading, error } = useServices(servicesKey);

  return (
    <AdminGate>
      <div className="space-y-8">
        <PageHeader
          badge="الخدمات"
          title="إدارة الخدمات"
          description="أضف خدمة جديدة بالكتابة، أو عدّل سعراً ومدة، أو احذف خدمة غير مستخدمة."
        />
        <AdminServices
          services={services}
          loading={loading}
          error={error}
          onChanged={() => setServicesKey((value) => value + 1)}
        />
      </div>
    </AdminGate>
  );
}
