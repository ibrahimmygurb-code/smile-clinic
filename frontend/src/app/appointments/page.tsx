"use client";

import AppointmentsGate from "@/components/AppointmentsGate";
import PageHeader from "@/components/PageHeader";

export default function AppointmentsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        badge="حسابك"
        title="مواعيدي"
        description="عرض مواعيدك المحفوظة: الطبيب، الخدمة، التاريخ، والوقت."
      />
      <AppointmentsGate />
    </div>
  );
}
