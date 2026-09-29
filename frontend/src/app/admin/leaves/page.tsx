"use client";

import { useState } from "react";
import AdminGate from "@/components/admin/AdminGate";
import AdminLeaves from "@/components/admin/AdminLeaves";
import PageHeader from "@/components/layout/PageHeader";
import { useDoctors } from "@/lib/useDoctors";

export default function AdminLeavesPage() {
  const [doctorsKey, setDoctorsKey] = useState(0);
  const { doctors, loading, error } = useDoctors(doctorsKey);

  return (
    <AdminGate>
      <div className="space-y-8">
        <PageHeader
          badge="الإجازات"
          title="إدارة الإجازات"
          description="حدد أيام إجازة كل طبيب. «أيام الإجازة» لليوم والقادم. «الإجازات السابقة» تعرض مجموع كل أيام الإجازة المسجّلة مع تواريخها."
        />
        <AdminLeaves
          doctors={doctors}
          loading={loading}
          error={error}
          onChanged={() => setDoctorsKey((value) => value + 1)}
        />
      </div>
    </AdminGate>
  );
}
