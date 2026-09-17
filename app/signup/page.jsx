"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Coffee, Store } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/site";
import { signUpSchema } from "@/lib/validation";
import { isPwned } from "@/lib/pwned";

const ROLES = [
  {
    value: "barista",
    label: "Saya Barista",
    desc: "Cari pekerjaan di coffee shop",
    icon: Coffee,
  },
  {
    value: "owner",
    label: "Saya Pemilik Usaha",
    desc: "Buka lowongan, cari barista",
    icon: Store,
  },
];

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [role, setRole] = useState(params.get("role") === "owner" ? "owner" : "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ name, email, phone, password, confirm });
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      return;
    }
    if (!role) {
      toast("Pilih dulu: barista atau pemilik usaha?", "error");
      return;
    }

    // F2P HIBP check (gratis, k-anonymity)
    if (await isPwned(password)) {
      setErrors({ password: "Password ini pernah bocor di internet, gunakan password lain yang lebih kuat" });
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Email konfirmasi selalu mendarat di website live, bukan localhost
          emailRedirectTo: `${SITE_URL}/auth/confirm?next=/onboarding/${role}`,
        },
      });
      if (error) throw error;

      if (!data.session) {
        // email confirmation is enabled on this project
        toast("Cek email kamu untuk konfirmasi akun");
        router.push("/login");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, role, email });
      if (profileError) throw profileError;

      // Prefill nama/HP ke tabel detail biar tak hilang sebelum onboarding (abaikan gagal — onboarding yang lengkapi).
      try {
        if (role === "owner") {
          await supabase.from("owners").insert({ id: data.user.id, business_name: name, whatsapp: phone || null });
        } else {
          await supabase.from("barista_profiles").insert({ id: data.user.id, full_name: name, whatsapp: phone || null });
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
          : err?.message || "Gagal mendaftar";
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-light min-h-[calc(100dvh-3.5rem)] text-[#2b2118]">
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-6 shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:p-8">
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-[#2b2118]">
        Buat akun gratis
      </h1>
      <p className="mt-1 text-center text-sm text-[#857768]">
        Gratis, tanpa biaya — profil sekali jadi
      </p>

      {/* Role selection */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {ROLES.map(({ value, label, desc, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`flex flex-col items-start rounded-2xl border-2 bg-[#ffffff] p-4 text-left transition-all ${
              role === value
                ? "border-[#3d2c1e] ring-2 ring-[#3d2c1e]/15"
                : "border-[#e8e0cf] hover:border-[#3d2c1e]"
            }`}
          >
            <span
              className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${
                role === value
                  ? "bg-[#3d2c1e] text-white"
                  : "bg-[#efe8d8] text-[#3d2c1e]"
              }`}
            >
              <Icon size={18} />
            </span>
            <span className="text-sm font-bold text-[#2b2118]">{label}</span>
            <span className="mt-0.5 text-[11px] leading-snug text-[#857768]">
              {desc}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          name="name"
          type="text"
          label="Nama"
          placeholder="Nama lengkap / nama usaha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoComplete="name"
        />
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          name="phone"
          type="tel"
          label="No. HP / WA"
          placeholder="08xxxxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          autoComplete="tel"
        />
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          name="confirm"
          type="password"
          label="Konfirmasi password"
          placeholder="Ulangi password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
        />
        <Button type="submit" full size="lg" variant="coffee" disabled={busy}>
          {busy ? "Mendaftarkan..." : "Daftar Sekarang"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#857768]">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-[#1f6b4a] hover:underline">
          Masuk
        </Link>
      </p>
      </div>
    </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
