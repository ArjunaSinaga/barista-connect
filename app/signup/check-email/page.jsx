"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

function CheckEmailInner() {
  const params = useSearchParams();
  const toast = useToast();
  const email = params.get("email") ?? "";
  const [busy, setBusy] = useState(false);

  async function resend() {
    if (!email) return;
    // ponytail: cooldown lokal 60 dtk, anti-spam kirim ulang; server tetap dijaga rate limit email Supabase.
    const last = Number(localStorage.getItem("bc-resend-at") || 0);
    if (Date.now() - last < 60_000) {
      toast("Tunggu sebentar sebelum kirim ulang");
      return;
    }
    setBusy(true);
    localStorage.setItem("bc-resend-at", String(Date.now()));
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      toast("Email verifikasi dikirim ulang, cek inbox/spam");
    } catch (err) {
      toast(err?.message || "Gagal kirim ulang", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-light min-h-[calc(100dvh-3.5rem)] text-[#2b2118]">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-6 text-center shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:p-8">
          <MailCheck size={40} className="mx-auto text-[#1f6b4a]" />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Silakan cek email kamu</h1>
          <p className="mt-2 text-sm leading-6 text-[#857768]">
            Kami mengirim link verifikasi ke <span className="font-bold text-[#2b2118]">{email || "emailmu"}</span>.
            Klik link itu, lalu masuk seperti biasa. Cek folder spam bila tidak ada.
          </p>
          <div className="mt-6 space-y-3">
            <Button full variant="coffee" disabled={busy || !email} onClick={resend}>
              {busy ? "Mengirim..." : "Kirim ulang email"}
            </Button>
            <Link href="/login" className="block text-sm font-bold text-[#1f6b4a] hover:underline">
              Sudah verifikasi? Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailInner />
    </Suspense>
  );
}
