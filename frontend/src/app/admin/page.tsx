"use client";

import AdminBookings from "@/components/AdminBookings";
import AdminGate from "@/components/AdminGate";
import PageHeader from "@/components/PageHeader";
import { useDoctors } from "@/lib/useDoctors";
import { useServices } from "@/lib/useServices";

export default function AdminPage() {
  const { doctors, loading: doctorsLoading } = useDoctors();
  const { services, loading: servicesLoading } = useServices();

  return (
    <AdminGate>
      <div className="space-y-8">
        <PageHeader
          badge="لوحة الإدارة"
          title="إدارة الحجوزات"
          description="عرض المواعيد والبحث فيها حسب المريض أو الطبيب أو الخدمة، مع الترتيب حسب التاريخ."
        />
        <AdminBookings
          doctors={doctors}
          doctorsLoading={doctorsLoading}
          services={services}
          servicesLoading={servicesLoading}
        />
      </div>
    </AdminGate>
  );
}
