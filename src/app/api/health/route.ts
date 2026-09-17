import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "connected",
      provider: "postgresql",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        database: "disconnected",
        error: "تعذر الاتصال بـ PostgreSQL. تحقق من DATABASE_URL وكلمة المرور.",
      },
      { status: 500 },
    );
  }
}
