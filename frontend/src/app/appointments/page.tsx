"use client";

import AppointmentsGate from "@/components/auth/AppointmentsGate";
import PageHeader from "@/components/layout/PageHeader";

export default function AppointmentsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        badge="المواعيد"
        title="المواعيد"
        description="عرض مواعيدك المحفوظة: الطبيب، الخدمة، التاريخ، والوقت."
      />
      <AppointmentsGate />
    </div>
  );
}
