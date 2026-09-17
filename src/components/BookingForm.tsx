"use client";

import { useEffect, useState } from "react";
import { dentalServices, timeSlots } from "@/data/services";
import type { Booking } from "@/lib/types";

type BookingFormProps = {
  defaultServiceId?: string;
};

type BookingData = {
  name: string;
  phone: string;
  serviceId: string;
  date: string;
  time: string;
};

export default function BookingForm({ defaultServiceId = "" }: BookingFormProps) {
  const [form, setForm] = useState<BookingData>({
    name: "",
    phone: "",
    serviceId: defaultServiceId,
    date: "",
    time: "",
  });
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedService = dentalServices.find((service) => service.id === form.serviceId);

  useEffect(() => {
    if (!form.date) {
      setBookedTimes([]);
      return;
    }

    const controller = new AbortController();

    fetch(`/api/availability?date=${form.date}`, { signal: controller.signal })
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
  }, [form.date]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
          تم تسجيل موعدك لخدمة{" "}
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
              phone: "",
              serviceId: defaultServiceId,
              date: "",
              time: "",
            });
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
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="dental-input"
            placeholder="05xxxxxxxx"
          />
        </div>
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

      <div className="grid gap-5 md:grid-cols-2">
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
            onChange={(event) => setForm({ ...form, date: event.target.value, time: "" })}
            className="dental-input"
          />
        </div>

        <div>
          <label htmlFor="time" className="mb-2 block text-sm font-semibold text-foreground">
            الوقت
          </label>
          <select
            id="time"
            required
            value={form.time}
            onChange={(event) => setForm({ ...form, time: event.target.value })}
            className="dental-input"
          >
            <option value="">اختر الوقت</option>
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
      </div>

      {selectedService && (
        <div className="rounded-xl border border-accent/20 bg-accent-soft/50 px-4 py-4 text-sm text-muted">
          <p className="font-semibold text-foreground">{selectedService.name}</p>
          <p className="mt-1">
            المدة: {selectedService.duration} دقيقة — السعر: {selectedService.price} ر.س
          </p>
        </div>
      )}

      <button type="submit" disabled={loading} className="dental-btn-primary w-full py-3.5 disabled:opacity-60">
        {loading ? "جاري حفظ الموعد..." : "تأكيد الحجز"}
      </button>
    </form>
  );
}
