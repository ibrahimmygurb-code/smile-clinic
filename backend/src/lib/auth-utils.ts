export const PHONE_PATTERN = /^05\d{8}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(/\s+/g, "");
}

export function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") ? normalizeEmail(trimmed) : normalizePhone(trimmed);
}
