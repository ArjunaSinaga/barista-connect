"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// Gabung tim via kode undangan. Wajib sudah daftar+login (komponen ini cuma render saat login).
// Validasi kode di server via RPC; salah 1x = pesan, bukan lock.
export default function JoinTeam() {
  const toast = useToast();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("join_team_by_code", { p_code: code.trim() });
      if (error) throw error;
      toast(`Masuk tim ${data?.cafe ?? "kafe"}!`);
      setCode("");
      router.refresh();
    } catch (err) {
      toast(err?.message || "Kode salah, cek lagi ke owner", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#2b2118]">
        <Users size={15} className="text-[#1f6b4a]" /> Sudah kerja di kafe? Gabung timnya
      </h2>
      <p className="mt-0.5 text-xs text-[#857768]">Minta kode tim ke owner / manager, masukkan di bawah.</p>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX"
          maxLength={9}
          className="min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-[#faf7ef] px-4 py-2 font-mono text-sm font-bold tracking-wider text-[#2b2118] uppercase placeholder:text-[#b6a98f] focus:border-[#3d2c1e] focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="inline-flex shrink-0 items-center rounded-full bg-[#3d2c1e] px-5 py-2 text-sm font-bold text-white hover:bg-[#2e2015] disabled:opacity-50"
        >
          {busy ? "..." : "Gabung"}
        </button>
      </form>
    </div>
  );
}
