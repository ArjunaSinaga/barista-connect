"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// Kode undangan per kafe: salin + acak ulang (kode lama langsung mati).
// ponytail: RPC validasi kepemilikan di server; client tak pernah list kode kafe lain.
export default function CafeInvite({ cafeId, initialCode }) {
  const toast = useToast();
  const [code, setCode] = useState(initialCode ?? "-");
  const [busy, setBusy] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      toast("Kode disalin, share ke grup WA kru");
    } catch {
      toast("Gagal salin", "error");
    }
  }

  async function regen() {
    if (!confirm("Acak kode baru? Kode lama langsung mati.")) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("regenerate_invite_code", { p_cafe_id: cafeId });
      if (error) throw error;
      setCode(data);
      toast("Kode baru aktif");
    } catch (err) {
      toast(err?.message || "Gagal acak kode", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-espresso-soft">
      <span>Kode tim: <span className="rounded bg-[#efe9d9] px-1.5 py-0.5 font-mono font-bold text-espresso">{code}</span></span>
      <button type="button" onClick={copy} className="inline-flex items-center gap-1 font-bold text-link hover:underline">
        <Copy size={11} /> Salin
      </button>
      <button type="button" onClick={regen} disabled={busy} className="inline-flex items-center gap-1 font-bold text-link hover:underline disabled:opacity-50">
        <RefreshCw size={11} /> {busy ? "..." : "Acak"}
      </button>
    </p>
  );
}
