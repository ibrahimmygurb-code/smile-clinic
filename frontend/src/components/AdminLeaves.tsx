"use client";

import { useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api";
import type { Doctor } from "@/lib/types";

type AdminLeavesProps = {
  doctors: Doctor[];
  loading: boolean;
  error: string;
  onChanged: () => void;
};

export default function AdminLeaves({ doctors, loading, error, onChanged }: AdminLeavesProps) {
  const [selectedId, setSelectedId] = useState("");
  const [offDates, setOffDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedId) ?? null;

  function selectDoctor(id: string) {
    const doctor = doctors.find((item) => item.id === id);
    setSelectedId(id);
    setOffDates(doctor ? [...doctor.offDates] : []);
    setDateInput("");
    setFormError("");
  }

  function addOffDate() {
    if (!dateInput || offDates.includes(dateInput)) {
      setDateInput("");
      return;
    }
    setOffDates([...offDates, dateInput].sort());
    setDateInput("");
  }

  async function saveLeaves(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDoctor) {
      setFormError("اختر الطبيب أولاً.");
      return;
    }

    setFormError("");
    setSaving(true);
    try {
      const response = await fetch(apiUrl(`/api/doctors/${selectedDoctor.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          name: selectedDoctor.name,
          specialty: selectedDoctor.specialty,
          offDates,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFormError(data.error ?? "تعذر حفظ أيام الإجازة.");
        return;
      }
      onChanged();
    } catch {
      setFormError("تعذر الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted">جاري تحميل الأطباء...</p>;
  }

  if (doctors.length === 0) {
    return <div className="dental-card p-6 text-center text-muted">أضف طبيباً أولاً من صفحة إدارة الأطباء.</div>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={saveLeaves} className="dental-card space-y-5 p-6">
        <div>
          <label htmlFor="leave-doctor" className="mb-2 block text-sm font-semibold">
            الطبيب
          </label>
          <select
            id="leave-doctor"
            required
            value={selectedId}
            onChange={(event) => selectDoctor(event.target.value)}
            className="dental-input"
          >
            <option value="">اختر الطبيب</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} — {doctor.specialty}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="leave-date" className="mb-2 block text-sm font-semibold">
            يوم الإجازة
          </label>
          <div className="flex flex-wrap items-end gap-3">
            <input
              id="leave-date"
              type="date"
              value={dateInput}
              disabled={!selectedDoctor}
              onChange={(event) => setDateInput(event.target.value)}
              className="dental-input max-w-[220px] disabled:opacity-60"
            />
            <button
              type="button"
              disabled={!selectedDoctor || !dateInput}
              onClick={addOffDate}
              className="dental-btn-primary shrink-0 px-5 py-2.5 text-sm shadow-lg shadow-accent/30 disabled:opacity-45 disabled:shadow-none disabled:hover:transform-none"
            >
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/25 text-lg font-bold leading-none"
              >
                +
              </span>
              إضافة يوم إجازة
            </button>
          </div>
          {offDates.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {offDates.map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"
                >
                  {date}
                  <button
                    type="button"
                    onClick={() => setOffDates(offDates.filter((item) => item !== date))}
                    className="text-red-600"
                    aria-label={`حذف إجازة ${date}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">لا توجد أيام إجازة لهذا الطبيب.</p>
          )}
        </div>

        {(error || formError) && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError || error}
          </div>
        )}

        <button type="submit" disabled={!selectedDoctor || saving} className="dental-btn-primary disabled:opacity-60">
          {saving ? "جاري الحفظ..." : "حفظ الإجازات"}
        </button>
      </form>

      <div className="overflow-x-auto dental-card">
        <table className="w-full min-w-[520px] text-right text-sm">
          <thead className="border-b border-border bg-accent-soft/40 text-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">الطبيب</th>
              <th className="px-4 py-3 font-semibold">أيام الإجازة</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{doctor.name}</td>
                <td className="px-4 py-3 text-muted">
                  {doctor.offDates.length === 0 ? "لا توجد" : doctor.offDates.join("، ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
