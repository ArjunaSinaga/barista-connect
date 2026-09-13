import { NextResponse } from "next/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { verifySignature } from "@/lib/midtrans";

export async function POST(request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "not configured" }, { status: 501 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;
  if (!order_id || !verifySignature({ orderId: order_id, statusCode: status_code, grossAmount: gross_amount, signatureKey: signature_key })) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments").select("*").eq("provider_order_id", order_id).single();
  if (!payment) return NextResponse.json({ ok: true }); // order bukan milik kita
  if (payment.status !== "pending") return NextResponse.json({ ok: true }); // idempoten

  if (transaction_status === "settlement" || transaction_status === "capture") {
    const { data: profile } = await admin
      .from("profiles").select("role").eq("id", payment.user_id).single();
    const table = profile?.role === "owner" ? "owners" : "barista_profiles";
    await admin.from(table).update({ is_verified: true, verified_at: new Date().toISOString() }).eq("id", payment.user_id);
    await admin.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", payment.id);
  } else if (["expire", "deny", "cancel"].includes(transaction_status)) {
    await admin.from("payments").update({ status: "expired" }).eq("id", payment.id);
  }
  return NextResponse.json({ ok: true });
}
