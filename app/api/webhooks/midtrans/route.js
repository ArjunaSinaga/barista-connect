import { NextResponse } from "next/server";

// Pembayaran dipindah ke BaristaConnect v2 — webhook dimatikan (nol transaksi live).
export async function POST() {
  return NextResponse.json({ error: "Pembayaran hadir di BaristaConnect v2" }, { status: 410 });
}
