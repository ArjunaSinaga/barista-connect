"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Store,
  GraduationCap,
  Info,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/site";
import { isPwned } from "@/lib/pwned";

const ROLES = [
  {
    value: "barista",
    label: "Pencari Kerja",
    desc: "Cari pekerjaan kasual dan tetap di industri F&B, hospitality, dan lainnya.",
    icon: Users,
    tile: "bg-amber-100 text-amber-700",
  },
  {
    value: "owner",
    label: "Pemberi Kerja",
    desc: "Rekrut talenta terpercaya untuk bisnis Anda.",
    icon: Store,
    tile: "bg-orange-100 text-orange-700",
  },
  {
    value: "academy",
    label: "Mitra Academy",
    desc: "Sediakan pelatihan dan ikut membangun talenta Indonesia.",
    icon: GraduationCap,
    tile: "bg-violet-100 text-violet-700",
  },
];

const STEPS = ["Buat akun", "Verifikasi email/telepon", "Lengkapi profil"];

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5.1l-.1.1-3.6 2.8v.1C3.5 21.4 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3l-.1-.1-3.6-2.8-.1.1C.5 8.7 0 10.2 0 12s.5 3.3 1.4 4.7l3.8-2.4z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.4 0 3.5 2.6 1.4 6.9l3.8 2.9c.9-3 3.6-5.1 6.8-5.1z"
      />
    </svg>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const rawRole = params.get("role") === "employer" ? "owner" : params.get("role");
  const [role, setRole] = useState(["owner", "barista", "academy"].includes(rawRole) ? rawRole : "barista");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function handleGoogle() {
    if (!role) {
      toast("Pilih peran dulu sebelum lanjut dengan Google", "error");
      return;
    }
    setGoogleBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${SITE_URL}/auth/confirm?next=/auth/verified&role=${role}`,
        },
      });
      if (error) throw error;
    } catch (err) {
      // REG-02: gagal/batal -> tetap di halaman dengan pesan jelas
      toast(err?.message || "Masuk dengan Google belum tersedia, gunakan email dulu", "error");
      setGoogleBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // ponytail: cooldown lokal 60 dtk, anti-spam klik; server tetap dijaga rate limit email Supabase.
    const last = Number(localStorage.getItem("bc-signup-at") || 0);
    if (Date.now() - last < 60_000) {
      toast("Tunggu sebentar sebelum daftar lagi", "error");
      return;
    }
    const errs = {};
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errs.email = "Masukkan email yang valid";
    if (password.length < 8) errs.password = "Password minimal 8 karakter";
    if (!role) {
      toast("Pilih dulu: pencari kerja, pemberi kerja, atau mitra academy?", "error");
      return;
    }
    if (!agree) {
      toast("Centang persetujuan Syarat & Ketentuan dulu", "error");
      return;
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // F2P HIBP check (gratis, k-anonymity)
    if (await isPwned(password)) {
      setErrors({ password: "Password ini pernah bocor di internet, gunakan password lain" });
      return;
    }

    setBusy(true);
    localStorage.setItem("bc-signup-at", String(Date.now()));
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          // Email konfirmasi selalu mendarat di website live, bukan localhost
          emailRedirectTo: `${SITE_URL}/auth/confirm?next=/auth/verified&role=${role}`,
          data: { role },
        },
      });
      if (error) throw error;

      // REG-14: email sudah terdaftar -> arahkan login, bukan akun ganda
      if (!data.session && (data.user?.identities?.length ?? 1) === 0) {
        toast("Email sudah terdaftar, silakan masuk", "error");
        router.push("/login");
        return;
      }

      if (!data.session) {
        // REG-16: verifikasi email aktif -> tahan di halaman cek-email
        router.push(`/signup/check-email?email=${encodeURIComponent(cleanEmail)}`);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, role, email: cleanEmail });
      if (profileError) throw profileError;

      // Nama lengkap + HP dilengkapi di langkah 3 (Lengkapi profil); baris
      // detail dibuat kosong agar tak hilang sebelum onboarding (abaikan gagal).
      try {
        if (role === "owner") {
          await supabase.from("owners").insert({ id: data.user.id, business_name: "", location: "", whatsapp: null });
        } else if (role === "academy") {
          await supabase.from("academy_profiles").insert({ id: data.user.id, name: "", description: "" });
        }
      } catch {
        // diam: onboarding tetap jalan
      }

      router.push(`/onboarding/${role}`);
      router.refresh();
    } catch (err) {
      const msg =
        err?.code === "user_already_exists"
          ? "Email sudah terdaftar, coba masuk"
          : err?.code === "email_provider_disabled"
            ? "Pendaftaran sedang dimatikan sementara, coba lagi nanti"
            : err?.code === "over_email_send_rate_limit"
              ? "Terlalu sering daftar, coba lagi sekitar 1 jam"
              : err?.message || "Gagal mendaftar";
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  const inputCls = (bad) =>
    `w-full rounded-xl border bg-white py-3 pr-4 pl-10 text-sm text-[#2f2721] placeholder-[#2f2721]/40 outline-none transition-colors ${
      bad ? "border-red-400" : "border-[#e0d5bd] focus:border-[#6f5a3e]"
    }`;

  return (
    <div>
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-[#2b2118]">
        Buat akun di kerja.inc
      </h1>
      <p className="mt-1 text-center text-sm text-[#2f2721]/60">
        Mulai perjalanan Anda — cari kerja, rekrut talenta, atau ikuti program pelatihan.
      </p>

      {/* REG-02: Google sign up */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleBusy || busy}
        className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#e0d5bd] bg-white text-sm font-bold text-[#2f2721] transition-colors hover:bg-[#faf6ec] disabled:opacity-50"
      >
        <GoogleMark />
        {googleBusy ? "Menghubungkan..." : "Lanjut dengan Google"}
      </button>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[#e8e0cf]" />
        <span className="text-xs text-[#2f2721]/50">atau</span>
        <span className="h-px flex-1 bg-[#e8e0cf]" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* REG-03 */}
        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-bold text-[#2b2118]">
            Email
          </label>
          <div className="relative">
            <Mail size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#2f2721]/40" />
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              className={inputCls(errors.email)}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* REG-04 + REG-05 */}
        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-bold text-[#2b2118]">
            Password
          </label>
          <div className="relative">
            <Lock size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#2f2721]/40" />
            <input
              id="reg-password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="Buat password (min. 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              className={`${inputCls(errors.password)} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
              aria-pressed={showPw}
              className="absolute top-1/2 right-2 inline-flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-lg text-[#2f2721]/50 hover:text-[#6f5a3e]"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        {/* REG-06/07/08 */}
        <fieldset>
          <legend className="mb-1.5 text-sm font-bold text-[#2b2118]">
            Saya ingin menggunakan kerja.inc sebagai:
          </legend>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {ROLES.map(({ value, label, desc, icon: Icon, tile }) => {
              const active = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  aria-pressed={active}
                  className={`relative flex min-h-[44px] flex-col rounded-2xl border-2 bg-white p-3.5 text-left transition-all ${
                    active ? "border-[#3d2c1e] ring-2 ring-[#3d2c1e]/20" : "border-[#e8e0cf] hover:border-[#6f5a3e]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full ${
                      active ? "bg-[#3d2c1e] text-white" : "bg-[#eee7d3] text-transparent"
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${tile}`}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="pr-5 text-sm font-bold text-[#2b2118]">{label}</span>
                  <span className="mt-0.5 text-[11px] leading-snug text-[#2f2721]/60">{desc}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* REG-09: info banner */}
        <p className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-[#2f2721]/80">
          <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600" />
          Anda dapat mengganti peran (role) nanti melalui pengaturan akun. Satu akun dapat memiliki
          lebih dari satu peran dengan verifikasi terpisah.
        </p>

        {/* REG-10/11/12 */}
        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-[#2f2721]/80">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#3d2c1e]"
          />
          <span>
            Saya menyetujui{" "}
            <Link href="/terms" target="_blank" rel="noopener" className="font-bold text-[#2b2118] underline underline-offset-2 hover:text-[#6f5a3e]">
              Syarat &amp; Ketentuan
            </Link>{" "}
            dan{" "}
            <Link href="/privacy" target="_blank" rel="noopener" className="font-bold text-[#2b2118] underline underline-offset-2 hover:text-[#6f5a3e]">
              Kebijakan Privasi
            </Link>{" "}
            kerja.inc.
          </span>
        </label>

        {/* REG-13 */}
        <button
          type="submit"
          disabled={busy || !agree}
          className="min-h-[50px] w-full rounded-xl bg-[#3d2c1e] text-sm font-bold text-white transition-colors hover:bg-[#2e2015] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Membuat akun..." : "Buat Akun"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[#2f2721]/60">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-[#2b2118] hover:underline">
          Masuk
        </Link>
      </p>

      {/* REG-17: indikator langkah */}
      <ol className="mt-6 flex items-center" aria-label="Langkah pendaftaran">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold ${
                  i === 0 ? "bg-[#3d2c1e] text-white" : "bg-[#eee7d3] text-[#2f2721]/60"
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-[11px] whitespace-nowrap ${i === 0 ? "font-bold text-[#2b2118]" : "text-[#2f2721]/55"}`}>
                {s}
              </span>
            </span>
            {i < STEPS.length - 1 && <span aria-hidden="true" className="mx-2 h-px flex-1 bg-[#e0d5bd]" />}
          </li>
        ))}
      </ol>
    </div>
  );
}
