/** تطبيع نص عربي للبحث: بدون تشكيل، وتوحيد أشكال الألف وغيرها. */
export function normalizeArabicSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .trim();
}

export function arabicSearchIncludes(haystack: string, needle: string): boolean {
  const q = normalizeArabicSearch(needle);
  if (!q) {
    return true;
  }
  return normalizeArabicSearch(haystack).includes(q);
}

export function arabicSearchMatchAny(haystacks: string[], needle: string): boolean {
  return haystacks.some((part) => arabicSearchIncludes(part, needle));
}
