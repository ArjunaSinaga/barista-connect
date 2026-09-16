"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// Toggle simpan kandidat (tabel saved_baristas). Hanya owner.
export default function SaveBaristaButton({ baristaId, baristaName, initialSaved = false }) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        const { error } = await supabase
          .from("saved_baristas")
          .delete()
          .eq("owner_id", user.id)
          .eq("barista_id", baristaId);
        if (error) throw error;
        setSaved(false);
        toast("Dihapus dari simpanan");
      } else {
        const { error } = await supabase
          .from("saved_baristas")
          .insert({ owner_id: user.id, barista_id: baristaId });
        if (error) throw error;
        setSaved(true);
        toast("Kandidat tersimpan ✓");
      }
      router.refresh();
    } catch {
      toast("Gagal menyimpan, coba lagi", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? `Hapus ${baristaName} dari simpanan` : `Simpan ${baristaName}`}
      title={saved ? "Tersimpan — klik untuk hapus" : "Simpan kandidat"}
      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ffffff]/90 text-[#6f6252] transition-colors hover:text-[#3d2c1e] disabled:opacity-50"
    >
      <Heart size={14} aria-hidden="true" className={saved ? "fill-[#c0392b] text-[#c0392b]" : ""} />
    </button>
  );
}
