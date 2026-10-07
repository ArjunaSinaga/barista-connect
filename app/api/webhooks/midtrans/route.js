import { NextResponse } from "next/server";

// Pembayaran dipindah ke kerja.inc v2 — webhook dimatikan (nol transaksi live).
export async function POST() {
  return NextResponse.json({ error: "Pembayaran hadir di kerja.inc v2" }, { status: 410 });
}
