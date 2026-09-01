"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Coffee, Store } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema } from "@/lib/validation";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ email, password });
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

    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center text-2xl font-extrabold text-[#fdf6ec]">
        Buat akun gratis
      </h1>
      <p className="mt-1 text-center text-sm text-[#fdf6ec]/60">
        Gabung bersama ribuan barista & coffee shop
      </p>

      {/* Role selection */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {ROLES.map(({ value, label, desc, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`flex flex-col items-start rounded-2xl border-2 bg-white p-4 text-left transition-all ${
              role === value
                ? "border-caramel ring-2 ring-caramel/20"
                : "border-[#e7ddd0] hover:border-[#d4a24e]/50"
            }`}
          >
            <span
              className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${
                role === value
                  ? "bg-[#d4a24e] text-white"
                  : "bg-[#f2f0eb] text-[#b45309]"
              }`}
            >
              <Icon size={18} />
            </span>
            <span className="text-sm font-bold text-[#1c1412]">{label}</span>
            <span className="mt-0.5 text-[11px] leading-snug text-[#1c1412]/60">
              {desc}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          name="password"
          type="password"
          label="Password"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? "Mendaftarkan..." : "Daftar Sekarang"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#fdf6ec]/60">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-caramel hover:underline">
          Masuk
        </Link>
      </p>
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
