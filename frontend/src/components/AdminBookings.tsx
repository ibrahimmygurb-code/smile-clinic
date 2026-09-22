"use client";

import { useEffect, useMemo, useState } from "react";
import AdminFormModal from "@/components/AdminFormModal";
import { apiUrl, authHeaders } from "@/lib/api";
import { arabicSearchMatchAny } from "@/lib/search-text";
import DoctorChoiceList from "@/components/DoctorChoiceList";
import { timeSlots } from "@/data/services";
import type { Booking, BookingStatus, Doctor, Service } from "@/lib/types";
import { isDoctorOnLeave } from "@/lib/types";

type EditForm = {
  name: string;
  phone: string;
  doctorId: string;
  serviceId: string;
  date: string;
  time: string;
  status: BookingStatus;
};

const emptyForm: EditForm = {
  name: "",
  phone: "",
  doctorId: "",
  serviceId: "",
  date: "",
  time: "",
  status: "confirmed",
};

type DateSortOrder = "nearest" | "farthest";

function bookingSortKey(booking: Booking) {
  return `${booking.date}T${booking.time}`;
}

type AdminBookingsProps = {
  doctors: Doctor[];
  doctorsLoading?: boolean;
  services: Service[];
  servicesLoading?: boolean;
};

export default function AdminBookings({
  doctors,
  doctorsLoading = false,
  services,
  servicesLoading = false,
}: AdminBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateSort, setDateSort] = useState<DateSortOrder>("nearest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function loadBookings() {
    try {
      const response = await fetch(apiUrl("/api/bookings"), {
        headers: { ...authHeaders() },
      });
      const data = (await response.json()) as { bookings?: Booking[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? "تعذر تحميل المواعيد.");
        return;
      }
      setError("");
      setBookings(data.bookings ?? []);
    } catch {
      setError("تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    fetch(apiUrl("/api/bookings"), {
      headers: { ...authHeaders() },
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as { bookings?: Booking[]; error?: string };
        if (!response.ok) {
          setError(data.error ?? "تعذر تحميل المواعيد.");
          return;
        }
        setBookings(data.bookings ?? []);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError("تعذر الاتصال بالخادم.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!editing || !form.date || !form.doctorId) {
      return;
    }

    const controller = new AbortController();
    fetch(
      apiUrl(
        `/api/availability?date=${form.date}&doctorId=${form.doctorId}&excludeId=${editing.id}`,
      ),
      { signal: controller.signal },
    )
      .then((response) => response.json())
      .then((data: { bookedTimes?: string[] }) => {
        setBookedTimes(data.bookedTimes ?? []);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setBookedTimes([]);
      });

    return () => controller.abort();
  }, [editing, form.date, form.doctorId]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      confirmed: bookings.filter((item) => item.status === "confirmed").length,
      cancelled: bookings.filter((item) => item.status === "cancelled").length,
      deleted: bookings.filter((item) => item.status === "deleted").length,
    };
  }, [bookings]);

  const doctorBookingCounts = useMemo(() => {
    const byDoctor = new Map<string, { name: string; total: number; confirmed: number }>();

    for (const doctor of doctors) {
      byDoctor.set(doctor.id, { name: doctor.name, total: 0, confirmed: 0 });
    }

    for (const booking of bookings) {
      const current = byDoctor.get(booking.doctorId) ?? {
        name: booking.doctorName,
        total: 0,
        confirmed: 0,
      };
      current.total += 1;
      if (booking.status === "confirmed") {
        current.confirmed += 1;
      }
      byDoctor.set(booking.doctorId, current);
    }

    return [...byDoctor.entries()]
      .map(([id, counts]) => ({ id, ...counts }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "ar"));
  }, [bookings, doctors]);

  const visibleBookings = useMemo(() => {
    const query = searchQuery.trim();
    let list = bookings;

    if (serviceFilter) {
      list = list.filter((booking) => booking.serviceId === serviceFilter);
    }

    if (doctorFilter) {
      list = list.filter((booking) => booking.doctorId === doctorFilter);
    }

    if (query) {
      list = list.filter((booking) =>
        arabicSearchMatchAny(
          [booking.name, booking.phone, booking.doctorName, booking.serviceName],
          query,
        ),
      );
    }

    return [...list].sort((a, b) => {
      const cmp = bookingSortKey(a).localeCompare(bookingSortKey(b));
      return dateSort === "farthest" ? -cmp : cmp;
    });
  }, [bookings, searchQuery, serviceFilter, doctorFilter, dateSort]);

  function startEdit(booking: Booking) {
    setEditing(booking);
    setForm({
      name: booking.name,
      phone: booking.phone,
      doctorId: booking.doctorId,
      serviceId: booking.serviceId,
      date: booking.date,
      time: booking.time,
      status: booking.status,
    });
    setError("");
  }

  function closeForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/bookings/${editing.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { booking?: Booking; error?: string };
      if (!response.ok) {
        setError(data.error ?? "تعذر حفظ التعديل.");
        return;
      }
      closeForm();
      await loadBookings();
    } catch {
      setError("تعذر الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBooking(id: string) {
    const confirmed = window.confirm("هل تريد نقل هذا الحجز إلى المواعيد المحذوفة؟");
    if (!confirmed) {
      return;
    }

    setBusyId(id);
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/bookings/${id}`), {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "تعذر حذف الموعد.");
        return;
      }
      if (editing?.id === id) {
        closeForm();
      }
      await loadBookings();
    } catch {
      setError("تعذر الاتصال بالخادم.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return <p className="text-muted">جاري تحميل المواعيد...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="dental-card p-5">
          <p className="text-sm text-muted">كل الحجوزات</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="dental-card p-5">
          <p className="text-sm text-muted">مواعيد مؤكدة</p>
          <p className="mt-1 text-3xl font-bold text-success">{stats.confirmed}</p>
        </div>
        <div className="dental-card p-5">
          <p className="text-sm text-muted">مواعيد ملغاة</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
        <div className="dental-card p-5">
          <p className="text-sm text-muted">مواعيد محذوفة</p>
          <p className="mt-1 text-3xl font-bold text-zinc-600">{stats.deleted}</p>
        </div>
      </div>

      {doctorBookingCounts.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground">حجوزات كل طبيب</h3>
            {doctorFilter && (
              <button
                type="button"
                onClick={() => setDoctorFilter("")}
                className="text-xs font-semibold text-accent hover:underline"
              >
                إظهار كل الأطباء
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {doctorBookingCounts.map((doctor) => {
              const selected = doctorFilter === doctor.id;
              return (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => setDoctorFilter(selected ? "" : doctor.id)}
                  className={`dental-card min-w-[11rem] shrink-0 p-4 text-right transition ${
                    selected ? "ring-2 ring-accent" : "hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <p className="truncate text-sm font-bold text-foreground">{doctor.name}</p>
                  <p className="mt-2 text-2xl font-bold text-accent">{doctor.total}</p>
                  <p className="mt-1 text-xs text-muted">
                    {doctor.confirmed} مؤكد
                    {doctor.total - doctor.confirmed > 0 ? ` · ${doctor.total - doctor.confirmed} أخرى` : ""}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && !editing && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AdminFormModal
        open={Boolean(editing)}
        wide
        title="تعديل الحجز"
        description="عدّل بيانات الموعد ثم احفظ."
        onClose={closeForm}
      >
        <form onSubmit={saveEdit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">اسم المريض</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="dental-input"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">الجوال</label>
              <input
                required
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="dental-input"
              />
            </div>
            <div className="md:col-span-2">
              <p className="mb-2 block text-sm font-semibold">الطبيب</p>
              {doctorsLoading ? (
                <p className="text-sm text-muted">جاري تحميل الأطباء...</p>
              ) : doctors.length === 0 ? (
                <p className="text-sm text-muted">لا يوجد أطباء.</p>
              ) : (
                <DoctorChoiceList
                  compact
                  doctors={doctors}
                  selectedId={form.doctorId}
                  date={form.date}
                  disabled={doctorsLoading}
                  onSelect={(doctorId) => setForm({ ...form, doctorId, time: "" })}
                />
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">الخدمة</label>
              <select
                required
                value={form.serviceId}
                disabled={servicesLoading || services.length === 0}
                onChange={(event) => setForm({ ...form, serviceId: event.target.value })}
                className="dental-input disabled:opacity-60"
              >
                {services.length === 0 && <option value="">لا توجد خدمات</option>}
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} — {service.price} ر.س
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">التاريخ</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(event) => {
                  const date = event.target.value;
                  const selectedDoctor = doctors.find((item) => item.id === form.doctorId);
                  const doctorId =
                    selectedDoctor && isDoctorOnLeave(selectedDoctor, date) ? "" : form.doctorId;
                  setForm({ ...form, date, doctorId, time: "" });
                }}
                className="dental-input"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">الوقت</label>
              <select
                required
                value={form.time}
                onChange={(event) => setForm({ ...form, time: event.target.value })}
                className="dental-input"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot} disabled={bookedTimes.includes(slot) && slot !== form.time}>
                    {slot}
                    {bookedTimes.includes(slot) && slot !== form.time ? " — محجوز" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">حالة الحجز</label>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as BookingStatus })
                }
                className="dental-input"
              >
                <option value="confirmed">مؤكد</option>
                <option value="cancelled">ملغى</option>
                <option value="deleted">محذوف</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="dental-btn-primary disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
            {form.status !== "deleted" && (
              <button
                type="button"
                onClick={() => editing && removeBooking(editing.id)}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                حذف الحجز
              </button>
            )}
          </div>
        </form>
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </AdminFormModal>

      {bookings.length === 0 ? (
        <div className="dental-card p-8 text-center text-muted">
          لا توجد مواعيد محفوظة بعد.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="dental-card grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4 md:items-end">
            <div>
              <label htmlFor="booking-search" className="mb-2 block text-sm font-semibold text-foreground">
                بحث في الحجوزات
              </label>
              <input
                id="booking-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="اسم المريض، الجوال، الطبيب، أو الخدمة..."
                className="dental-input"
              />
            </div>
            <div>
              <label htmlFor="booking-doctor-filter" className="mb-2 block text-sm font-semibold text-foreground">
                الطبيب
              </label>
              <select
                id="booking-doctor-filter"
                value={doctorFilter}
                disabled={doctorsLoading}
                onChange={(event) => setDoctorFilter(event.target.value)}
                className="dental-input disabled:opacity-60"
              >
                <option value="">كل الأطباء</option>
                {doctorBookingCounts.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.total})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="booking-service-filter" className="mb-2 block text-sm font-semibold text-foreground">
                نوع الخدمة
              </label>
              <select
                id="booking-service-filter"
                value={serviceFilter}
                onChange={(event) => setServiceFilter(event.target.value)}
                className="dental-input"
              >
                <option value="">كل الخدمات</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="booking-date-sort" className="mb-2 block text-sm font-semibold text-foreground">
                ترتيب حسب التاريخ
              </label>
              <select
                id="booking-date-sort"
                value={dateSort}
                onChange={(event) => setDateSort(event.target.value as DateSortOrder)}
                className="dental-input"
              >
                <option value="nearest">من الأقرب إلى الأبعد</option>
                <option value="farthest">من الأبعد إلى الأقرب</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-muted">
            {visibleBookings.length === bookings.length
              ? `عرض ${bookings.length} حجز`
              : `عرض ${visibleBookings.length} من ${bookings.length} حجز`}
          </p>

          {visibleBookings.length === 0 ? (
            <div className="dental-card p-8 text-center text-muted">
              لا توجد نتائج مطابقة للبحث.
            </div>
          ) : (
        <div className="overflow-x-auto dental-card">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead className="border-b border-border bg-accent-soft/40 text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">المريض</th>
                <th className="px-4 py-3 font-semibold">الجوال</th>
                <th className="px-4 py-3 font-semibold">الطبيب</th>
                <th className="px-4 py-3 font-semibold">الخدمة</th>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
                <th className="px-4 py-3 font-semibold">الوقت</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className={`border-b border-border last:border-b-0 ${editing?.id === booking.id ? "bg-accent-soft/60" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{booking.name}</td>
                  <td className="px-4 py-3 text-muted">{booking.phone}</td>
                  <td className="px-4 py-3 text-muted">{booking.doctorName}</td>
                  <td className="px-4 py-3 text-muted">{booking.serviceName}</td>
                  <td className="px-4 py-3 text-muted">{booking.date}</td>
                  <td className="px-4 py-3 text-muted">{booking.time}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        booking.status === "confirmed"
                          ? "rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success"
                          : booking.status === "deleted"
                            ? "rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600"
                            : "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                      }
                    >
                      {booking.status === "confirmed"
                        ? "مؤكد"
                        : booking.status === "deleted"
                          ? "محذوف"
                          : "ملغى"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-pressed={editing?.id === booking.id}
                        onClick={() => startEdit(booking)}
                        className="dental-btn-edit"
                      >
                        تعديل
                      </button>
                      {booking.status !== "deleted" && (
                        <button
                          type="button"
                          disabled={busyId === booking.id}
                          onClick={() => removeBooking(booking.id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {busyId === booking.id ? "..." : "حذف"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
        </div>
      )}
    </div>
  );
}
