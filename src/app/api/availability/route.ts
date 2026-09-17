import { NextRequest, NextResponse } from "next/server";
import { getBookedTimes } from "@/lib/bookings-store";
import { databaseErrorResponse } from "@/lib/db-error";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "حدد التاريخ لمعرفة الأوقات المتاحة." }, { status: 400 });
  }

  try {
    const bookedTimes = await getBookedTimes(date);
    return NextResponse.json({ date, bookedTimes });
  } catch {
    return databaseErrorResponse();
  }
}
