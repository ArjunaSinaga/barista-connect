"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch {
      toast("Gagal mengirim email, coba lagi", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      {sent ? (
        <div className="rounded-2xl card-dark p-8 text-center">
          <MailCheck className="mx-auto text-matcha" size={44} />
          <h1 className="mt-4 text-xl font-extrabold text-espresso">
            Cek inbox kamu
          </h1>
          <p className="mt-2 text-sm text-espresso-soft">
            Kami mengirim tautan reset password ke{" "}
            <span className="font-bold">{email}</span>. Klik tautannya untuk
            membuat password baru.
          </p>
          <Button href="/login" variant="secondary" full className="mt-6">
            Kembali ke halaman masuk
          </Button>
        </div>
      ) : (
        <>
          <h1 className="text-center text-2xl font-extrabold text-espresso">
            Reset password
          </h1>
          <p className="mt-1 mb-8 text-center text-sm text-espresso-soft">
            Masukkan email terdaftar, kami kirim tautan reset.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" full size="lg" disabled={busy}>
              {busy ? "Mengirim..." : "Kirim Tautan Reset"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
