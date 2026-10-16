"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/site";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [busy, setBusy] = useState(false);
  const linkError = params.get("error");

  async function handleSubmit(e) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) {
      toast("Isi email dulu", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      toast("Format email salah", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(clean, {
        // Selalu ke website live — link dari localhost bakal mati di tangan user
        redirectTo: `${SITE_URL}/auth/confirm?next=/update-password`,
      });
    } catch {
      // Respons generik: jangan bocorkan email terdaftar atau tidak
    } finally {
      setBusy(false);
      router.push(`/forgot-password/sent?email=${encodeURIComponent(clean)}`);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[#f5f1e8] text-espresso">
      <div className="border-b border-[#e8e0cf] bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
            kerja<span className="text-caramel">.inc</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border border-espresso px-5 py-2 text-xs font-bold hover:bg-espresso hover:text-white">
              Login
            </Link>
            <Link href="/signup" className="rounded-full bg-espresso px-5 py-2 text-xs font-bold text-white hover:opacity-90">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden rounded-2xl bg-[#c69a6b] lg:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-64 w-64 items-center justify-center rounded-full bg-white">
              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-[#7a4f2c]">
                <div className="h-20 w-20 rounded-full bg-[#e8dcc3]" />
              </div>
            </div>
          </div>
          <p className="absolute inset-x-0 bottom-0 bg-espresso px-8 py-6 font-display text-2xl italic text-white">
            Kerja baik,
            <br />
            lebih banyak kemungkinan.
          </p>
        </div>
        <div className="rounded-2xl border border-[#e8e0cf] bg-white p-6 shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e4cf]">
            <Lock size={26} className="text-[#7a4f2c]" />
          </span>
          <h1 className="mt-4 text-center font-serif text-3xl font-extrabold tracking-tight">
            Lupa password?
          </h1>
          <p className="mt-2 text-center text-sm text-espresso-soft">
            Masukkan email akun kerja.inc kamu. Kami akan mengirim link untuk membuat password baru.
          </p>
          {linkError ? (
            <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
              {linkError}
            </p>
          ) : null}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" full size="lg" variant="coffee" disabled={busy} className="rounded-full min-h-[44px]">
              {busy ? "Mengirim..." : "Kirim Link Reset"}
            </Button>
            <p className="text-center text-sm">
              <Link href="/login" className="text-xs font-bold text-caramel hover:underline">← Kembali ke Login</Link>
            </p>
          </form>
          <div className="mt-6 border-t border-[#e8e0cf] pt-4 text-center">
            <p className="text-xs text-espresso-soft">Butuh bantuan?</p>
            <p className="mt-1 text-sm font-bold">
              <Link href="/help" className="text-caramel hover:underline">Hubungi Support</Link>
            </p>
            <p className="mt-2 text-[11px] text-espresso-soft">Link reset berlaku 30 menit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
