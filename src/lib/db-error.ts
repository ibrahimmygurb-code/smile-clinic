import { NextResponse } from "next/server";

export const DATABASE_SETUP_MESSAGE =
  "تعذر الاتصال بـ PostgreSQL. افتح ملف .env وضع كلمة مرور قاعدة البيانات، أنشئ قاعدة smile_clinic، ثم نفّذ npm run db:migrate";

export function databaseErrorResponse() {
  return NextResponse.json({ error: DATABASE_SETUP_MESSAGE }, { status: 503 });
}
