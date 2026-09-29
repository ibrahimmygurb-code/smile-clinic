"use client";

import { useState } from "react";
import AdminDoctors from "@/components/admin/AdminDoctors";
import AdminGate from "@/components/admin/AdminGate";
import PageHeader from "@/components/layout/PageHeader";
import { useDoctors } from "@/lib/useDoctors";

export default function AdminDoctorsPage() {
  const [doctorsKey, setDoctorsKey] = useState(0);
  const { doctors, loading, error } = useDoctors(doctorsKey);

  return (
    <AdminGate>
      <div className="space-y-8">
        <PageHeader
          badge="الأطباء"
          title="إدارة الأطباء"
          description="إضافة طبيب جديد، أو تعديل اسمه وتخصصه، أو حذفه من قائمة الحجز."
        />
        <AdminDoctors
          doctors={doctors}
          loading={loading}
          error={error}
          onChanged={() => setDoctorsKey((value) => value + 1)}
        />
      </div>
    </AdminGate>
  );
}
