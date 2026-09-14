import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import {
  VERIFY_PRODUCTS,
  QRIS_EXPIRY_MINUTES,
  midtransConfigured,
  createQrisCharge,
} from "@/lib/midtrans";

export async function POST(request) {
  const rl = rateLimit(request, { scope: "checkout", limit: 10 });
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);
  if (!midtransConfigured()) {
    return NextResponse.json({ error: "Pembayaran belum dikonfigurasi" }, { status: 501 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "profil tidak ditemukan" }, { status: 404 });

  const product = profile.role === "owner" ? "verified_owner" : "verified_barista";
  const table = profile.role === "owner" ? "owners" : "barista_profiles";
  const { amount, label } = VERIFY_PRODUCTS[product];

  const { data: existing } = await supabase
    .from(table).select("is_verified").eq("id", user.id).single();
  if (existing?.is_verified) {
    return NextResponse.json({ error: "Akunmu sudah terverifikasi" }, { status: 400 });
  }

  // Pakai ulang order pending yang belum kedaluwarsa
  const { data: pending } = await supabase
    .from("payments")
    .select("id, provider_order_id, expires_at")
    .eq("user_id", user.id)
    .eq("product", product)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (pending) {
    return NextResponse.json({ orderId: pending.provider_order_id, reused: true });
  }

  const orderId = `verify-${product.split("_")[1]}-${user.id.slice(0, 8)}-${Date.now()}`;
  const expiresAt = new Date(Date.now() + QRIS_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const { error: insertError } = await supabase.from("payments").insert({
    user_id: user.id, product, amount, status: "pending",
    provider: "midtrans", provider_order_id: orderId, expires_at: expiresAt,
  });
  if (insertError) {
    return NextResponse.json({ error: "Gagal membuat order" }, { status: 500 });
  }

  try {
    const qr = await createQrisCharge({ orderId, amount });
    return NextResponse.json({
      orderId, qrString: qr.qrString, qrUrl: qr.qrUrl,
      expiresAt, amount, label,
    });
  } catch (err) {
    await supabase.from("payments").delete().eq("provider_order_id", orderId);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
