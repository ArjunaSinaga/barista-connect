"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/site";

function maskEmail(email) {
  const [user, domain] = String(email).split("@");
  if (!user || !domain) return email;
  return `${user[0]}***@${domain}`;
}

export default function SentPage() {
  return (
    <Suspense>
      <SentContent />
    </Suspense>
  );
}

function SentContent() {
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (!email) router.replace("/forgot-password");
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0 || busy) return;
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${SITE_URL}/auth/confirm?next=/update-password`,
      });
      setCooldown(60);
      toast("Link baru dikirim, link lama hangus");
    } catch {
      toast("Gagal mengirim ulang, coba lagi", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!email) return null;

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

      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-2xl border border-[#e8e0cf] bg-white p-6 text-center shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e3f0e8]">
            <MailCheck size={32} className="text-matcha" />
          </span>
          <h1 className="mt-4 font-serif text-3xl font-extrabold tracking-tight">Cek email kamu</h1>
          <p className="mt-2 text-sm leading-6 text-espresso-soft">
            Kami sudah mengirim link reset password ke{" "}
            <span className="font-bold text-espresso">{maskEmail(email)}</span>. Buka email
            tersebut dan klik link-nya dalam 30 menit.
          </p>
          <a
            href={`mailto:${email}`}
            className="mt-6 flex min-h-[44px] items-center justify-center rounded-full bg-espresso px-6 text-sm font-bold text-white hover:opacity-90"
          >
            Buka Aplikasi Email
          </a>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || busy}
            className="mt-3 min-h-[44px] w-full rounded-full bg-[#e8e0cf] px-6 text-sm font-bold text-espresso-soft disabled:opacity-60"
          >
            {cooldown > 0
              ? `Kirim Ulang Link (00:${String(cooldown).padStart(2, "0")})`
              : busy
                ? "Mengirim..."
                : "Kirim Ulang Link"}
          </button>
          <p className="mt-4 rounded-xl bg-[#f7ecd9] px-4 py-3 text-xs leading-5 text-espresso-soft">
            Tidak ada email? Periksa folder <span className="font-bold">Spam / Promosi</span>.
            Email dari noreply@kerja.inc.
          </p>
          <div className="mt-4 flex items-center justify-between text-xs font-bold">
            <Link
              href={`/forgot-password?email=${encodeURIComponent(email)}`}
              className="text-caramel hover:underline"
            >
              Salah email? Ganti email
            </Link>
            <Link href="/login" className="text-caramel hover:underline">
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
