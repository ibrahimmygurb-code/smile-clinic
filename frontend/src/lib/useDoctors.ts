"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import type { Doctor } from "@/lib/types";

export function useDoctors(refreshKey = 0) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/doctors"));
      const data = (await response.json()) as { doctors?: Doctor[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? "تعذر تحميل قائمة الأطباء.");
        setDoctors([]);
        return;
      }
      setError("");
      setDoctors(data.doctors ?? []);
    } catch {
      setError("تعذر الاتصال بالخادم.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch(apiUrl("/api/doctors"), { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as { doctors?: Doctor[]; error?: string };
        if (!response.ok) {
          setError(data.error ?? "تعذر تحميل قائمة الأطباء.");
          return;
        }
        setError("");
        setDoctors(data.doctors ?? []);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError("تعذر الاتصال بالخادم.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [refreshKey]);

  return { doctors, loading, error, reload };
}
