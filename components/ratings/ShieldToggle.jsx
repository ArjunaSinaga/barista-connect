"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Eye } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

// Toggle Rating Shield: yang dinilai sembunyikan/tampilkan rating tentang dirinya.
// kind: "tentang_saya_barista" | "tentang_kafe_saya"
// GATE langganan: cek Shield aktif di sini saat Midtrans ON (sekarang beta manual).
export default function ShieldToggle({ kind, id, hidden }) {
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!id) return null;
  async function flip() {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("set_rating_hidden", {
        p_kind: kind, p_id: id, p_hidden: !hidden,
      });
      if (error) throw error;
      toast(hidden ? "Rating ditampilkan lagi ke publik" : "Rating disembunyikan dari publik");
      router.refresh();
    } catch (err) {
      toast(err.message || "Gagal mengubah", "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button" onClick={flip} disabled={busy}
      title={hidden ? "Tampilkan lagi ke publik" : "Sembunyikan dari publik"}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold disabled:opacity-50 ${hidden ? "bg-gray-200 text-gray-600" : "bg-caramel/10 text-caramel hover:bg-caramel/20"}`}
    >
      {hidden ? <Eye size={12} /> : <EyeOff size={12} />}
      {hidden ? "Tersembunyi" : "Sembunyikan"}
    </button>
  );
}
