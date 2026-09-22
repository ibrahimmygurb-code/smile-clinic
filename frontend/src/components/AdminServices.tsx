"use client";

import { useEffect, useRef, useState } from "react";
import AdminFormModal from "@/components/AdminFormModal";
import ServiceIconPicker from "@/components/ServiceIconPicker";
import { apiUrl, authHeaders } from "@/lib/api";
import { DEFAULT_SERVICE_ICON, ServiceIcon } from "@/lib/service-icons";
import type { Service } from "@/lib/types";

type AdminServicesProps = {
  services: Service[];
  loading: boolean;
  error: string;
  onChanged: () => void;
};

type ServiceForm = {
  name: string;
  description: string;
  duration: string;
  price: string;
  icon: string;
};

const emptyForm: ServiceForm = {
  name: "",
  description: "",
  duration: "30",
  price: "150",
  icon: DEFAULT_SERVICE_ICON,
};

export default function AdminServices({ services, loading, error, onChanged }: AdminServicesProps) {
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const iconFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showIconPicker) return;
    function handlePointerDown(event: MouseEvent) {
      if (iconFieldRef.current && !iconFieldRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showIconPicker]);

  function startAdd() {
    setEditingId("");
    setForm(emptyForm);
    setFormError("");
    setShowIconPicker(false);
    setFormOpen(true);
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description,
      duration: String(service.duration),
      price: String(service.price),
      icon: service.icon,
    });
    setFormError("");
    setShowIconPicker(false);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId("");
    setForm(emptyForm);
    setFormError("");
    setShowIconPicker(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const response = await fetch(apiUrl(editingId ? `/api/services/${editingId}` : "/api/services"), {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          duration: Number(form.duration),
          price: Number(form.price),
          icon: form.icon || DEFAULT_SERVICE_ICON,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFormError(data.error ?? (editingId ? "تعذر حفظ التعديل." : "تعذر إضافة الخدمة."));
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

  async function handleDelete(service: Service) {
    const confirmed = window.confirm(`هل تريد حذف خدمة «${service.name}»؟`);
    if (!confirmed) {
      return;
    }

    setBusyId(service.id);
    setFormError("");
    try {
      const response = await fetch(apiUrl(`/api/services/${service.id}`), {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFormError(data.error ?? "تعذر حذف الخدمة.");
        return;
      }
      if (editingId === service.id) {
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
        <p className="text-sm text-muted">اضغط إضافة لإدخال خدمة جديدة، أو تعديل لفتح بياناتها.</p>
        <button type="button" onClick={startAdd} className="dental-btn-primary">
          إضافة خدمة
        </button>
      </div>

      {error && !formOpen && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AdminFormModal
        open={formOpen}
        title={editingId ? "تعديل الخدمة" : "إضافة خدمة"}
        description="اكتب اسم الخدمة والوصف والمدة والسعر، ثم احفظ ليظهر في صفحة الخدمات والحجز."
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="service-name" className="mb-2 block text-sm font-semibold">
                اسم الخدمة
              </label>
              <input
                id="service-name"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="dental-input"
                placeholder="مثال: تقويم شفاف"
              />
            </div>
            <div ref={iconFieldRef}>
              <label htmlFor="service-icon" className="mb-2 block text-sm font-semibold">
                أيقونة (اختياري)
              </label>
              <button
                id="service-icon"
                type="button"
                onClick={() => setShowIconPicker((open) => !open)}
                className="dental-input flex w-full cursor-pointer items-center justify-center !py-2"
                title="اضغط لاختيار أيقونة"
              >
                <ServiceIcon icon={form.icon} size="md" />
              </button>
              <ServiceIconPicker
                value={form.icon}
                open={showIconPicker}
                onClose={() => setShowIconPicker(false)}
                onChange={(icon) => setForm({ ...form, icon })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="service-description" className="mb-2 block text-sm font-semibold">
              وصف الخدمة
            </label>
            <textarea
              id="service-description"
              required
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="dental-input min-h-[96px] resize-y"
              placeholder="اكتب وصفاً قصيراً يظهر للمرضى..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label htmlFor="service-duration" className="mb-2 block text-sm font-semibold">
                المدة (دقيقة)
              </label>
              <input
                id="service-duration"
                type="number"
                required
                min={10}
                max={300}
                value={form.duration}
                onChange={(event) => setForm({ ...form, duration: event.target.value })}
                className="dental-input"
              />
            </div>
            <div>
              <label htmlFor="service-price" className="mb-2 block text-sm font-semibold">
                السعر (ر.س)
              </label>
              <input
                id="service-price"
                type="number"
                required
                min={0}
                max={100000}
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                className="dental-input"
              />
            </div>
            <button type="submit" disabled={saving} className="dental-btn-primary disabled:opacity-60">
              {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديل" : "إضافة خدمة"}
            </button>
          </div>
        </form>

        {(error || formError) && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError || error}
          </div>
        )}
      </AdminFormModal>

      {loading ? (
        <p className="text-muted">جاري تحميل الخدمات...</p>
      ) : services.length === 0 ? (
        <div className="dental-card p-6 text-center text-muted">لا توجد خدمات بعد. اضغط «إضافة خدمة» للبدء.</div>
      ) : (
        <div className="overflow-x-auto dental-card">
          <table className="w-full min-w-[700px] text-right text-sm">
            <thead className="border-b border-border bg-accent-soft/40 text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">الخدمة</th>
                <th className="px-4 py-3 font-semibold">المدة</th>
                <th className="px-4 py-3 font-semibold">السعر</th>
                <th className="px-4 py-3 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className={`border-b border-border last:border-b-0 ${editingId === service.id ? "bg-accent-soft/60" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <ServiceIcon icon={service.icon} size="sm" />
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        <p className="mt-1 text-xs leading-6 text-muted">{service.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{service.duration} دقيقة</td>
                  <td className="px-4 py-3 text-muted">{service.price} ر.س</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-pressed={editingId === service.id}
                        onClick={() => startEdit(service)}
                        className="dental-btn-edit"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        disabled={busyId === service.id}
                        onClick={() => handleDelete(service)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {busyId === service.id ? "..." : "حذف"}
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
