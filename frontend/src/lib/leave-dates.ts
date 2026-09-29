export function todayInRiyadh() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
}

export function currentLeaveDates(dates: string[]) {
  const today = todayInRiyadh();
  return dates.filter((date) => date >= today).sort();
}

/** كل أيام الإجازة المسجّلة (منتهية + اليوم والقادمة) بدون تكرار */
export function allRegisteredLeaveDates(doctor: { offDates: string[]; pastOffDates?: string[] }) {
  const upcoming = currentLeaveDates(doctor.offDates);
  const past = [...(doctor.pastOffDates ?? [])].sort();
  return [...new Set([...past, ...upcoming])].sort();
}

export function formatLeaveDayMonth(date: string) {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) {
    return date;
  }
  return `${Number(day)}/${Number(month)}`;
}

export function formatLeaveDayMonths(dates: string[]) {
  return dates.map(formatLeaveDayMonth).join(", ");
}

function formatArabicDays(days: number) {
  if (days === 1) return "1 يوم";
  if (days === 2) return "يومان";
  if (days >= 3 && days <= 10) return `${days} أيام`;
  return `${days} يوماً`;
}

function formatArabicMonths(months: number) {
  if (months === 1) return "شهر";
  if (months === 2) return "شهران";
  if (months >= 3 && months <= 10) return `${months} أشهر`;
  return `${months} شهراً`;
}

/** مجموع أيام الإجازة السابقة: 32 يوماً → «شهر ويومان» */
export function formatPastLeaveDuration(days: number) {
  if (days <= 0) {
    return "لا توجد";
  }

  const months = Math.floor(days / 30);
  const rest = days % 30;
  const parts: string[] = [];

  if (months > 0) {
    parts.push(formatArabicMonths(months));
  }
  if (rest > 0) {
    parts.push(formatArabicDays(rest));
  }

  return parts.join(" و");
}
