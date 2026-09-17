"use client";

import { useEffect, useState } from "react";
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
          .single();
        const role = profile?.role ?? "barista";
        const table = role === "owner" ? "owners" : "barista_profiles";
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

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center text-2xl font-extrabold text-espresso">
        Password baru
      </h1>
      <p className="mt-1 mb-8 text-center text-sm text-espresso-soft">
        Buat password baru untuk akun kamu.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="password"
          type="password"
          label="Password baru"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Input
          name="confirm"
          type="password"
          label="Ulangi password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? "Menyimpan..." : "Simpan Password"}
        </Button>
      </form>
    </div>
  );
}
