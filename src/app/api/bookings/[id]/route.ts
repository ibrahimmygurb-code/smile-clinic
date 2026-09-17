import { NextResponse } from "next/server";
import { cancelBooking, getBookingById } from "@/lib/bookings-store";
import { databaseErrorResponse } from "@/lib/db-error";

type BookingRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: BookingRouteContext) {
  const { id } = await params;

  try {
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: "الموعد غير موجود." }, { status: 404 });
    }
    return NextResponse.json({ booking });
  } catch {
    return databaseErrorResponse();
  }
}

export async function PATCH(_request: Request, { params }: BookingRouteContext) {
  const { id } = await params;

  try {
    const result = await cancelBooking(id);
    if (!result.ok) {
      const status = result.error.includes("غير موجود") ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json({ booking: result.booking });
  } catch {
    return databaseErrorResponse();
  }
}
