"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// ponytail: 1 tombol issue sertifikat ke anggota tim aktif via RPC (tanpa tabel baru).
export default function IssueCertButton({ baristaId, name }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const clean = label.trim();
    if (!clean) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("issue_certificate", {
        p_barista_id: baristaId,
        p_label: clean,
      });
      if (error) throw error;
      toast(`Sertifikat "${clean}" diterbitkan ke ${name}`);
      setOpen(false);
      setLabel("");
      router.refresh();
    } catch (err) {
      toast(err.message || "Gagal menerbitkan sertifikat", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Beri sertifikat"
        aria-label={`Beri sertifikat ke ${name}`}
        className="shrink-0 rounded-full p-2 text-espresso-soft/50 hover:bg-[#e3f0e8] hover:text-matcha"
      >
        <Award size={16} />
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex shrink-0 items-center gap-1.5">
      <label htmlFor={`cert-${baristaId}`} className="sr-only">Nama sertifikat untuk {name}</label>
      <input
        id={`cert-${baristaId}`}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="cth. Latte Art Pro"
        maxLength={80}
        autoComplete="off"
        className="h-8 w-36 rounded-full border border-[#e0d5bd] bg-white px-3 text-xs text-espresso outline-none placeholder:text-[#b6a98f] focus:border-coffee"
      />
      <button
        type="submit"
        disabled={busy || !label.trim()}
        className="inline-flex h-8 items-center rounded-full bg-coffee px-3 text-[11px] font-bold text-white hover:bg-[#2e2015] disabled:opacity-50"
      >
        {busy ? "..." : "Terbitkan"}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setLabel(""); }}
        className="text-[11px] font-bold text-espresso-soft hover:text-espresso"
      >
        Batal
      </button>
    </form>
  );
}
