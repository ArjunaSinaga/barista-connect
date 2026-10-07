import { NextResponse } from "next/server";

// Pembayaran dipindah ke kerja.inc v2 — tak ada order baru yang diproses.
export async function GET() {
  return NextResponse.json({ error: "Pembayaran hadir di kerja.inc v2" }, { status: 410 });
}
