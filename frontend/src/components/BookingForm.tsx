"use client";

import { useEffect, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api";
import { dentalServices, timeSlots } from "@/data/services";
import type { Booking } from "@/lib/types";
import { isDoctorOnLeave } from "@/lib/types";
import DoctorChoiceList from "@/components/DoctorChoiceList";
import { useAuth } from "@/components/AuthProvider";
import { useDoctors } from "@/lib/useDoctors";

type BookingFormProps = {
  defaultServiceId?: string;
};

type BookingData = {
  name: string;
  phone: string;
  doctorId: string;
  serviceId: string;
  date: string;
  time: string;
};

export default function BookingForm({ defaultServiceId = "" }: BookingFormProps) {
  const { user } = useAuth();
  const { doctors, loading: doctorsLoading } = useDoctors();
  const [form, setForm] = useState<BookingData>({
    name: "",
    phone: "",
    doctorId: "",
    serviceId: defaultServiceId,
    date: "",
    time: "",
  });
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const phoneValue = form.phone || user?.phone || "";

  const selectedService = dentalServices.find((service) => service.id === form.serviceId);
  const selectedDoctor = doctors.find((doctor) => doctor.id === form.doctorId);

  useEffect(() => {
    if (!form.date || !form.doctorId) {
      return;
    }

    const controller = new AbortController();

    fetch(apiUrl(`/api/availability?date=${form.date}&doctorId=${form.doctorId}`), {
      signal: controller.signal,
      headers: authHeaders(),
    })
      .then((response) => response.json())
      .then((data: { bookedTimes?: string[] }) => {
        const times = data.bookedTimes ?? [];
        setBookedTimes(times);
        setForm((current) =>
          current.time && times.includes(current.time)
            ? { ...current, time: "" }
            : current,
        );
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setBookedTimes([]);
      });

    return () => controller.abort();
  }, [form.date, form.doctorId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.doctorId) {
      setError("اختر الطبيب.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(apiUrl("/api/bookings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ ...form, phone: phoneValue }),
      });
      const data = (await response.json()) as { booking?: Booking; error?: string };

      if (!response.ok || !data.booking) {
        setError(data.error ?? "تعذر إتمام الحجز. حاول مرة أخرى.");
        return;
      }

      setCreatedBooking(data.booking);
    } catch {
      setError("تعذر الاتصال بالخادم. تأكد أن المشروع يعمل.");
    } finally {
      setLoading(false);
    }
  }

  if (createdBooking) {
    return (
      <div className="dental-card border-success/30 bg-success-soft/30 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-2xl text-white">
          ✓
        </div>
        <p className="mt-4 text-sm font-semibold text-success">تم حفظ الموعد في النظام</p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">شكراً {createdBooking.name}</h2>
        <p className="mx-auto mt-3 max-w-md leading-8 text-muted">
          تم تسجيل موعدك مع{" "}
          <strong className="text-foreground">{createdBooking.doctorName}</strong> لخدمة{" "}
          <strong className="text-foreground">{createdBooking.serviceName}</strong> يوم{" "}
          <strong className="text-foreground">{createdBooking.date}</strong> الساعة{" "}
          <strong className="text-foreground">{createdBooking.time}</strong>.
        </p>
        <p className="mt-2 text-sm text-muted">سنتواصل معك على: {createdBooking.phone}</p>
        <p className="mt-3 text-xs text-muted">رقم الحجز: {createdBooking.id}</p>
        <button
          type="button"
          onClick={() => {
            setCreatedBooking(null);
            setForm({
              name: "",
              phone: user?.phone ?? "",
              doctorId: "",
              serviceId: defaultServiceId,
              date: "",
              time: "",
            });
            setBookedTimes([]);
          }}
          className="dental-btn-secondary mt-6"
        >
          حجز موعد جديد
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="dental-card space-y-5 p-6 md:p-8">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold text-foreground">بيانات الحجز</h2>
        <p className="mt-1 text-sm text-muted">املأ الحقول التالية لإتمام طلب الموعد</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-foreground">
            الاسم الكامل
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="dental-input"
            placeholder="مثال: أحمد محمد"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-foreground">
            رقم الجوال
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phoneValue}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="dental-input"
            placeholder="05xxxxxxxx"
          />
        </div>
      </div>

      <div>
        <label htmlFor="date" className="mb-2 block text-sm font-semibold text-foreground">
          التاريخ
        </label>
        <input
          id="date"
          type="date"
          required
          value={form.date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(event) => {
            const nextDate = event.target.value;
            const selected = doctors.find((item) => item.id === form.doctorId);
            const doctorId = selected && isDoctorOnLeave(selected, nextDate) ? "" : form.doctorId;
            setForm({ ...form, date: nextDate, doctorId, time: "" });
            if (!nextDate || !doctorId) {
              setBookedTimes([]);
            }
          }}
          className="dental-input"
        />
      </div>

      <div>
        <p id="doctor" className="mb-2 block text-sm font-semibold text-foreground">
          اختر الطبيب
        </p>
        {doctorsLoading ? (
          <p className="text-sm text-muted">جاري تحميل الأطباء...</p>
        ) : doctors.length === 0 ? (
          <p className="text-sm text-muted">لا يوجد أطباء متاحون حالياً.</p>
        ) : (
          <DoctorChoiceList
            doctors={doctors}
            selectedId={form.doctorId}
            date={form.date}
            onSelect={(doctorId) => {
              setForm({ ...form, doctorId, time: "" });
              if (!doctorId) {
                setBookedTimes([]);
              }
            }}
          />
        )}
        {form.date && doctors.some((doctor) => isDoctorOnLeave(doctor, form.date)) && (
          <p className="mt-2 text-xs text-muted">
            الشارة البرتقالية «غير متاح» على اليسار تعني أن الطبيب في إجازة في هذا اليوم.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="service" className="mb-2 block text-sm font-semibold text-foreground">
          نوع الخدمة
        </label>
        <select
          id="service"
          required
          value={form.serviceId}
          onChange={(event) => setForm({ ...form, serviceId: event.target.value })}
          className="dental-input"
        >
          <option value="">اختر الخدمة</option>
          {dentalServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} — {service.price} ر.س
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="time" className="mb-2 block text-sm font-semibold text-foreground">
          الوقت
        </label>
          <select
            id="time"
            required
            value={form.time}
            disabled={!form.doctorId || !form.date}
            onChange={(event) => setForm({ ...form, time: event.target.value })}
            className="dental-input disabled:opacity-60"
          >
            <option value="">
              {!form.doctorId || !form.date ? "اختر الطبيب والتاريخ أولاً" : "اختر الوقت"}
            </option>
            {timeSlots.map((slot) => {
              const taken = bookedTimes.includes(slot);
              return (
                <option key={slot} value={slot} disabled={taken}>
                  {slot}
                  {taken ? " — محجوز" : ""}
                </option>
              );
            })}
          </select>
      </div>

      {(selectedDoctor || selectedService) && (
        <div className="rounded-xl border border-accent/20 bg-accent-soft/50 px-4 py-4 text-sm text-muted">
          {selectedDoctor && (
            <p className="font-semibold text-foreground">
              الطبيب: {selectedDoctor.name} — {selectedDoctor.specialty}
            </p>
          )}
          {selectedService && (
            <p className="mt-1">
              الخدمة: {selectedService.name} — المدة: {selectedService.duration} دقيقة — السعر:{" "}
              {selectedService.price} ر.س
            </p>
          )}
        </div>
      )}

      <button type="submit" disabled={loading} className="dental-btn-primary w-full py-3.5 disabled:opacity-60">
        {loading ? "جاري حفظ الموعد..." : "تأكيد الحجز"}
      </button>
    </form>
  );
}
