"use client";

import { Suspense, useState } from "react";
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
          toast("Gagal terhubung ke Supabase. Cek env di Netlify dan Site URL di Supabase Auth → URL Configuration.", "error");
        } else {
          toast(msg === "Invalid login credentials" ? "Email atau password salah" : msg, "error");
        }
        return;
      }
      if (!data?.user) {
        toast("Login gagal tanpa session. Cek env/cookie di Netlify (pastikan deploy ulang setelah set env).", "error");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      const role = profile?.role ?? "barista";

      const table = role === "owner" ? "owners" : "barista_profiles";
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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center text-2xl font-extrabold text-espresso">
        Masuk ke akun kamu
      </h1>
      <p className="mt-1 text-center text-sm text-espresso-soft">
        Senang bertemu lagi ☕
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
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-caramel hover:underline"
          >
            Lupa password?
          </Link>
        </div>
        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-espresso-soft">
        Belum punya akun?{" "}
        <Link href="/signup" className="font-bold text-caramel hover:underline">
          Daftar gratis
        </Link>
      </p>
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
