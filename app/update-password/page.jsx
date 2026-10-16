"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Sesi recovery dibuat oleh /auth/confirm sebelum mendarat di sini.
    // Tanpa sesi (mis. tautan basi) beri pesan jelas, bukan lempar diam-diam.
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setReady(true);
      } else {
        toast("Tautan reset tidak valid atau sudah dipakai. Minta tautan baru.", "error");
        router.replace("/forgot-password");
      }
    });
  }, [router, toast]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) {
      toast("Password minimal 8 karakter", "error");
      return;
    }
    if (password !== confirm) {
      toast("Konfirmasi password tidak sama", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Arahkan sesuai peran + status onboarding, sama seperti login
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let dest = "/login";
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        const role = ["owner", "barista", "academy"].includes(profile?.role) ? profile.role : "barista";
        const table = role === "owner" ? "owners" : role === "academy" ? "academy_profiles" : "barista_profiles";
        const { data: detail } = await supabase
          .from(table)
          .select("id")
          .eq("id", user.id)
          .maybeSingle();
        dest = detail ? `/dashboard/${role}` : `/onboarding/${role}`;
      }
      toast("Password berhasil diubah");
      router.push(dest);
      router.refresh();
    } catch {
      toast("Gagal mengubah password", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  const hasMin = password.length >= 8;
  const hasCase = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const isMatch = password.length > 0 && password === confirm;
  const score = [hasMin, hasCase, hasNum, isMatch].filter(Boolean).length;
  const strengthLabel = score <= 1 ? "Lemah" : score === 3 ? "Cukup" : score >= 4 ? "Kuat" : "Sedang";
  const strengthColor = score <= 1 ? "#b3392f" : score >= 4 ? "#1f6b4a" : "#9a6a2f";
  const strengthWidth = `${(score / 4) * 100}%`;

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
      <div className="rounded-3xl border border-[#e8e0cf] bg-white p-6 shadow-[0_2px_16px_rgba(43,33,24,0.10)] sm:p-8">
      <h1 className="font-serif text-3xl font-extrabold tracking-tight text-espresso">
        Buat password baru
      </h1>
      <p className="mt-1 mb-8 text-sm text-espresso-soft">
        Pilih password yang kuat dan belum pernah dipakai di akun lain.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            name="password"
            type={show ? "text" : "password"}
            label="Password baru"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-3 top-9 rounded-full bg-[#f0e4cf] px-3 py-1 text-[11px] font-bold text-espresso"
          >
            {show ? "Sembunyi" : "Tampilkan"}
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="text-xs font-bold text-espresso">Kekuatan:</span>
            <span className="h-2 flex-1 rounded-full bg-[#e8e0cf]">
              <span className="block h-2 rounded-full" style={{ width: strengthWidth, background: strengthColor }} />
            </span>
            <span className="text-xs font-bold" style={{ color: strengthColor }}>{strengthLabel}</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-espresso-soft">
            <li><span className={hasMin ? "font-bold text-matcha" : ""}>{hasMin ? "✓" : "○"} Minimal 8 karakter</span></li>
            <li><span className={hasCase ? "font-bold text-matcha" : ""}>{hasCase ? "✓" : "○"} Ada huruf besar &amp; kecil</span></li>
            <li><span className={hasNum ? "font-bold text-matcha" : ""}>{hasNum ? "✓" : "○"} Ada angka</span></li>
            <li><span className={isMatch ? "font-bold text-matcha" : ""}>{isMatch ? "✓" : "○"} Sama dengan konfirmasi</span></li>
          </ul>
        </div>
        <Input
          name="confirm"
          type={show ? "text" : "password"}
          label="Konfirmasi password"
          placeholder="••••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
        <Button type="submit" full size="lg" variant="coffee" disabled={busy} className="rounded-xl min-h-[50px] text-sm font-bold">
          {busy ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
        <p className="text-center text-xs font-bold text-caramel">
          <Link href="/forgot-password" className="hover:underline">Link kedaluwarsa? Minta link baru</Link>
        </p>
        <p className="text-center text-[11px] text-espresso-soft">Link ini hanya dapat dipakai satu kali.</p>
      </form>
      </div>
      </div>
      </div>
    </div>
  );
}
