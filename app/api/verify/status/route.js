import { NextResponse } from "next/server";

// Pembayaran dipindah ke BaristaConnect v2 — tak ada order baru yang diproses.
export async function GET() {
  return NextResponse.json({ error: "Pembayaran hadir di BaristaConnect v2" }, { status: 410 });
}
