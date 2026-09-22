"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import type { Service } from "@/lib/types";

export function useServices(refreshKey = 0) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/services"));
      const data = (await response.json()) as { services?: Service[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? "تعذر تحميل قائمة الخدمات.");
        setServices([]);
        return;
      }
      setError("");
      setServices(data.services ?? []);
    } catch {
      setError("تعذر الاتصال بالخادم.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch(apiUrl("/api/services"), { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as { services?: Service[]; error?: string };
        if (!response.ok) {
          setError(data.error ?? "تعذر تحميل قائمة الخدمات.");
          return;
        }
        setError("");
        setServices(data.services ?? []);
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

  return { services, loading, error, reload };
}
