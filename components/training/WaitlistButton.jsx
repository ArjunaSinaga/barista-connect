"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ponytail: 1 tombol waitlist beneran (email → tabel waitlists). Tanpa tabel baru di kode, tanpa auth.
export default function WaitlistButton({ topic = "training", label = "Ikut waitlist", className = "", outline = false }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Email tidak valid");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("waitlists").insert({ email: email.trim().toLowerCase(), topic });
      if (error && !String(error.message).includes("duplicate")) throw error;
      setDone(true);
    } catch {
      setError("Gagal menyimpan, coba lagi");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className={`inline-flex min-h-[34px] items-center justify-center rounded-full bg-[#e3f0e8] px-4 text-[11px] font-bold text-[#1f6b4a] ${className}`}>
        ✓ Kamu di daftar tunggu
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-[34px] flex-1 items-center justify-center rounded-full px-2 text-[11px] font-bold ${
          outline
            ? "border border-[#d8cdae] bg-[#ffffff] text-[#3d2c1e] hover:border-[#3d2c1e]"
            : "bg-[#3d2c1e] text-white hover:bg-[#2e2015]"
        } ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className={`min-w-0 flex-1 ${className}`}>
      <form onSubmit={submit} className="flex items-center gap-1.5">
        <label htmlFor={`wl-${topic}`} className="sr-only">Email untuk daftar tunggu</label>
        <input
          id={`wl-${topic}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          autoComplete="email"
          className="h-9 min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-3 text-xs text-[#2b2118] outline-none placeholder:text-[#b6a98f] focus:border-[#3d2c1e]"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-[#3d2c1e] px-4 text-[11px] font-bold text-white hover:bg-[#2e2015] disabled:opacity-50"
        >
          {busy ? "..." : "Kirim"}
        </button>
      </form>
      {error && <p role="alert" className="mt-1 text-[11px] font-bold text-red-600">{error}</p>}
    </div>
  );
}
