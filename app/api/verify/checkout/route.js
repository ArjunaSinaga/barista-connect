import { NextResponse } from "next/server";

// Pembayaran dipindah ke kerja.inc v2 — halaman /verify menjelaskan.
// Endpoint dimatikan agar tak ada order baru yang nyangkut.
export async function POST() {
  return NextResponse.json({ error: "Pembayaran hadir di kerja.inc v2" }, { status: 410 });
}
