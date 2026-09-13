import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { midtransConfigured, getTransactionStatus } from "@/lib/midtrans";

async function activate(admin, payment) {
  const { data: profile } = await admin
    .from("profiles").select("role").eq("id", payment.user_id).single();
  const table = profile?.role === "owner" ? "owners" : "barista_profiles";
  await admin.from(table).update({ is_verified: true, verified_at: new Date().toISOString() }).eq("id", payment.user_id);
  await admin.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", payment.id);
}

export async function GET(request) {
  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: payment } = await supabase
    .from("payments").select("*").eq("provider_order_id", orderId).single();
  if (!payment || payment.user_id !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (payment.status !== "pending") {
    return NextResponse.json({ status: payment.status });
  }

  // Rekonsiliasi ke Midtrans (safety net kalau webhook telat/gagal)
  if (midtransConfigured() && adminConfigured()) {
    try {
      const tx = await getTransactionStatus(orderId);
      const admin = createAdminClient();
      if (tx.transaction_status === "settlement" || tx.transaction_status === "capture") {
        await activate(admin, payment);
        return NextResponse.json({ status: "paid" });
      }
      if (["expire", "deny", "cancel"].includes(tx.transaction_status)) {
        await admin.from("payments").update({ status: "expired" }).eq("id", payment.id);
        return NextResponse.json({ status: "expired" });
      }
      if (payment.expires_at && new Date(payment.expires_at) < new Date()) {
        await admin.from("payments").update({ status: "expired" }).eq("id", payment.id);
        return NextResponse.json({ status: "expired" });
      }
    } catch {
      // Midtrans tak terjangkau — laporkan status lokal
    }
  }
  return NextResponse.json({ status: "pending", expiresAt: payment.expires_at });
}
