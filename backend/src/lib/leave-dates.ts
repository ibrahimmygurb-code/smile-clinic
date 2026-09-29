const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayInRiyadh() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
}

export function isValidLeaveDate(value: string) {
  return DATE_PATTERN.test(value);
}

export function splitLeaveDates(offDates: string[], pastOffDates: string[] = []) {
  const today = todayInRiyadh();
  const current: string[] = [];
  const past = new Set(pastOffDates.filter(isValidLeaveDate));

  for (const date of offDates) {
    if (!isValidLeaveDate(date)) {
      continue;
    }
    if (date < today) {
      past.add(date);
    } else {
      current.push(date);
    }
  }

  const nextCurrent = [...new Set(current)].sort();
  const nextPast = [...past].sort();
  const changed =
    nextCurrent.join(",") !== [...offDates].sort().join(",") ||
    nextPast.join(",") !== [...pastOffDates].sort().join(",");

  return { current: nextCurrent, past: nextPast, changed };
}
