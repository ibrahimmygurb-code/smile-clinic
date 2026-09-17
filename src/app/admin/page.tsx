import AdminBookings from "@/components/AdminBookings";
import PageHeader from "@/components/PageHeader";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        badge="لوحة العيادة"
        title="إدارة المواعيد"
        description="هذه الصفحة تعرض المواعيد المحفوظة في PostgreSQL. حالياً بدون تسجيل دخول لأنها مرحلة تعلم."
      />
      <AdminBookings />
    </div>
  );
}
