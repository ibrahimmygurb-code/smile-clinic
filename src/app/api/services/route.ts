import { NextResponse } from "next/server";
import { dentalServices } from "@/data/services";

export async function GET() {
  return NextResponse.json({ services: dentalServices });
}
