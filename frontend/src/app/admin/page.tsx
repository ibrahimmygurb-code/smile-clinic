"use client";

import AdminBookings from "@/components/admin/AdminBookings";
import AdminGate from "@/components/admin/AdminGate";
import PageHeader from "@/components/layout/PageHeader";
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
          description="اضغط على شهر لفتح حجوزاته في نافذة مستقلة، أو ابحث في كل المواعيد حسب المريض أو الطبيب أو الخدمة."
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
