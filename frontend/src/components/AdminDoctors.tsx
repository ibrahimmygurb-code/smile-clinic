"use client";

import { useState } from "react";
import AdminFormModal from "@/components/AdminFormModal";
import { apiUrl, authHeaders } from "@/lib/api";
import type { Doctor } from "@/lib/types";

type AdminDoctorsProps = {
  doctors: Doctor[];
  loading: boolean;
  error: string;
  onChanged: () => void;
};

type DoctorForm = {
  name: string;
  specialty: string;
  offDates: string[];
};

const emptyForm: DoctorForm = {
  name: "",
  specialty: "",
  offDates: [],
};

export default function AdminDoctors({ doctors, loading, error, onChanged }: AdminDoctorsProps) {
  const [form, setForm] = useState<DoctorForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  function startAdd() {
    setEditingId("");
    setForm(emptyForm);
    setFormError("");
    setFormOpen(true);
  }

  function startEdit(doctor: Doctor) {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      offDates: [...doctor.offDates],
    });
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId("");
    setForm(emptyForm);
    setFormError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const response = await fetch(apiUrl(editingId ? `/api/doctors/${editingId}` : "/api/doctors"), {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          name: form.name,
          specialty: form.specialty,
          offDates: form.offDates,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFormError(data.error ?? (editingId ? "تعذر حفظ التعديل." : "تعذر إضافة الطبيب."));
        return;
      }
      closeForm();
      onChanged();
    } catch {
      setFormError("تعذر الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(doctor: Doctor) {
    const confirmed = window.confirm(`هل تريد حذف ${doctor.name}؟`);
    if (!confirmed) {
      return;
    }

    setBusyId(doctor.id);
    setFormError("");
    try {
      const response = await fetch(apiUrl(`/api/doctors/${doctor.id}`), {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFormError(data.error ?? "تعذر حذف الطبيب.");
        return;
      }
      if (editingId === doctor.id) {
        closeForm();
      }
      onChanged();
    } catch {
      setFormError("تعذر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">اضغط إضافة لإدخال طبيب جديد، أو تعديل لفتح بياناته.</p>
        <button type="button" onClick={startAdd} className="dental-btn-primary">
          إضافة طبيب
        </button>
      </div>

      {error && !formOpen && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AdminFormModal
        open={formOpen}
        title={editingId ? "تعديل الطبيب" : "إضافة طبيب"}
        description="أدخل الاسم والتخصص، ثم احفظ."
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label htmlFor="doctor-name" className="mb-2 block text-sm font-semibold">
              اسم الطبيب
            </label>
            <input
              id="doctor-name"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="dental-input"
              placeholder="مثال: د. محمد الشمري"
            />
          </div>
          <div>
            <label htmlFor="doctor-specialty" className="mb-2 block text-sm font-semibold">
              التخصص
            </label>
            <input
              id="doctor-specialty"
              required
              value={form.specialty}
              onChange={(event) => setForm({ ...form, specialty: event.target.value })}
              className="dental-input"
              placeholder="مثال: جراحة الفم"
            />
          </div>
          <button type="submit" disabled={saving} className="dental-btn-primary disabled:opacity-60">
            {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديل" : "إضافة طبيب"}
          </button>
        </form>

        {(error || formError) && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError || error}
          </div>
        )}
      </AdminFormModal>

      {loading ? (
        <p className="text-muted">جاري تحميل الأطباء...</p>
      ) : doctors.length === 0 ? (
        <div className="dental-card p-6 text-center text-muted">لا يوجد أطباء مسجلون بعد. اضغط «إضافة طبيب» للبدء.</div>
      ) : (
        <div className="overflow-x-auto dental-card">
          <table className="w-full min-w-[520px] text-right text-sm">
            <thead className="border-b border-border bg-accent-soft/40 text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">الاسم</th>
                <th className="px-4 py-3 font-semibold">التخصص</th>
                <th className="px-4 py-3 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr
                  key={doctor.id}
                  className={`border-b border-border last:border-b-0 ${editingId === doctor.id ? "bg-accent-soft/60" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{doctor.name}</td>
                  <td className="px-4 py-3 text-muted">{doctor.specialty}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-pressed={editingId === doctor.id}
                        onClick={() => startEdit(doctor)}
                        className="dental-btn-edit"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        disabled={busyId === doctor.id}
                        onClick={() => handleDelete(doctor)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {busyId === doctor.id ? "..." : "حذف"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
