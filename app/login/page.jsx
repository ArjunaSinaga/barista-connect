"use client";

import { ArrowLeft } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // ponytail: link konfirmasi basi/diklik-2x mendarat di sini — sambut, jangan lempar reset password
  useEffect(() => {
    if (params.get("verified") === "1") toast("Email sudah terverifikasi, silakan masuk", "success");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      return;
    }

    setBusy(true);
    try {
      let supabase;
      try {
        supabase = createClient();
      } catch (e) {
        toast(e.message, "error");
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        const msg = error.message ?? "";
        if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
          toast("Gagal terhubung ke Supabase. Cek env di Vercel dan Site URL di Supabase Auth → URL Configuration.", "error");
        } else if (msg === "Invalid login credentials") {
          // ponytail: toast cepat hilang — tulis juga inline biar nempel di field
          setErrors({ password: "Email atau password salah" });
        } else {
          toast(msg, "error");
        }
        return;
      }
      if (!data?.user) {
        toast("Login gagal tanpa session. Cek env/cookie di Vercel (pastikan deploy ulang setelah set env).", "error");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      // Peran dibaca dari database — user tak perlu menebak.
      // ponytail: profiles bisa kosong (konfirm via SQL/admin atau insert confirm gagal diam)
      // -> pulihkan dari metadata signup, catat biar tak nebak lagi.
      let role = profile?.role;
      if (!role) {
        const meta = data.user.user_metadata || {};
        role = ["owner", "barista", "academy"].includes(meta.role) ? meta.role : "barista";
        try {
          await supabase.from("profiles").insert({ id: data.user.id, role, email: data.user.email });
        } catch {
          // diam: onboarding tetap jalan, peran sudah benar
        }
      }

      const table = role === "owner" ? "owners" : role === "academy" ? "academy_profiles" : "barista_profiles";
      const { data: detail } = await supabase
        .from(table)
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      const next = params.get("next");
      const dest =
        next ||
        (detail
          ? `/dashboard/${role}`
          : `/onboarding/${role}`);

      router.push(dest);
      router.refresh();
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
        <div className="rounded-3xl border border-[#e8e0cf] bg-white p-6 shadow-[0_2px_16px_rgba(43,33,24,0.10)] sm:p-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-espresso">
            Masuk
          </h1>
          <p className="mt-1 text-sm text-espresso-soft">
            Lanjutkan ke dashboard barista atau owner kafe.
          </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
        {/* Input sudah punya tombol intip password bawaan */}
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />
        <Button type="submit" full size="lg" variant="coffee" disabled={busy} className="rounded-xl min-h-[50px] text-sm font-bold">
          {busy ? "Memproses..." : "Masuk"}
        </Button>
        <p className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-link hover:underline"
          >
            Lupa password?
          </Link>
        </p>
      </form>

      <p className="mt-6 border-t border-[#e8e0cf] pt-4 text-center text-sm text-espresso-soft">
        Belum punya akun?{" "}
        <Link href="/register" className="font-bold text-link hover:underline">
          Daftar
        </Link>
      </p>
      </div>
      </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
