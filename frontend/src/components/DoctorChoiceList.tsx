"use client";

import type { Doctor } from "@/lib/types";
import { isDoctorOnLeave } from "@/lib/types";

type DoctorChoiceListProps = {
  doctors: Doctor[];
  selectedId: string;
  date: string;
  onSelect: (doctorId: string) => void;
  disabled?: boolean;
  compact?: boolean;
};

export default function DoctorChoiceList({
  doctors,
  selectedId,
  date,
  onSelect,
  disabled = false,
  compact = false,
}: DoctorChoiceListProps) {
  return (
    <div className={`space-y-2 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      {doctors.map((doctor) => {
        const off = isDoctorOnLeave(doctor, date);
        const selected = selectedId === doctor.id;

        return (
          <button
            key={doctor.id}
            type="button"
            disabled={off || disabled}
            onClick={() => onSelect(doctor.id)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border text-right transition ${
              compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
            } ${
              off
                ? "cursor-not-allowed border-zinc-200 bg-zinc-50/90"
                : selected
                  ? "border-accent bg-accent-soft/70 shadow-sm ring-2 ring-accent/20"
                  : "border-border bg-white hover:border-accent/35 hover:bg-accent-soft/25"
            }`}
          >
            <span className={off ? "text-zinc-500" : "font-semibold text-foreground"}>
              {doctor.name}
              {!compact && <span className="font-normal text-muted"> — {doctor.specialty}</span>}
            </span>
            {off && (
              <span className="shrink-0 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-sm">
                غير متاح
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
