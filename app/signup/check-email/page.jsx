"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck, ArrowLeft } from "lucide-react";
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
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[#f6f1e5] text-[#2f2721]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-semibold text-[#2f2721]/70 hover:text-[#6f5a3e]"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Kembali ke beranda
        </Link>
      <div className="mx-auto mt-4 max-w-md">
        <div className="rounded-3xl border border-[#e8e0cf] bg-white p-6 text-center shadow-[0_2px_16px_rgba(43,33,24,0.10)] sm:p-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e3f0e8]">
            <MailCheck size={32} className="text-matcha" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">Cek email kamu</h1>
          <p className="mt-2 text-sm leading-6 text-espresso-soft">
            Kami mengirim tautan verifikasi ke <span className="font-bold text-espresso">{email || "emailmu"}</span>.
            Buka inbox dan klik tautannya untuk mengaktifkan akun.
          </p>
          <p className="mt-4 rounded-xl bg-[#faf7ef] px-4 py-3 text-xs text-espresso-soft">
            Tidak ketemu? Cek folder Spam atau Promosi.
          </p>
          <div className="mt-6 space-y-3">
            <Button full variant="coffee" disabled={busy || !email} onClick={resend} className="rounded-xl min-h-[50px] text-sm font-bold">
              {busy ? "Mengirim..." : "Kirim ulang dalam 00:60"}
            </Button>
            <Link href="/register" className="block text-xs font-bold text-link hover:underline">
              Salah alamat email? Ganti email
            </Link>
            <Link href="/login" className="block text-xs font-bold text-link hover:underline">
              Kembali ke Masuk
            </Link>
          </div>
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
