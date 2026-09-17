import { NextResponse } from "next/server";

// Pembayaran dipindah ke BaristaConnect v2 — halaman /verify menjelaskan.
// Endpoint dimatikan agar tak ada order baru yang nyangkut.
export async function POST() {
  return NextResponse.json({ error: "Pembayaran hadir di BaristaConnect v2" }, { status: 410 });
}
