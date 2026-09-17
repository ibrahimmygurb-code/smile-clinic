import { NextResponse } from "next/server";
import { createBooking, listBookings } from "@/lib/bookings-store";
import { databaseErrorResponse } from "@/lib/db-error";
import { validateBookingInput } from "@/lib/validation";

export async function GET() {
  try {
    const bookings = await listBookings();
    return NextResponse.json({ bookings });
  } catch {
    return databaseErrorResponse();
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة البيانات غير صحيحة." }, { status: 400 });
  }

  const validation = validateBookingInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await createBooking(validation.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ booking: result.booking }, { status: 201 });
  } catch {
    return databaseErrorResponse();
  }
}
