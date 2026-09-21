"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// Toggle simpan lowongan (tabel saved_jobs). Tamu → login. Non-barista → ditolak jujur.
export default function SaveButton({ jobId, initialSaved = false, variant = "icon" }) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/jobs?job=${jobId}`)}`);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "barista") {
      toast("Hanya akun barista yang bisa menyimpan", "error");
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("barista_id", user.id)
          .eq("job_post_id", jobId);
        if (error) throw error;
        setSaved(false);
        toast("Dihapus dari simpanan");
      } else {
        const { error } = await supabase
          .from("saved_jobs")
          .insert({ barista_id: user.id, job_post_id: jobId });
        if (error) throw error;
        setSaved(true);
        toast("Lowongan tersimpan ✓");
      }
      router.refresh();
    } catch {
      toast("Gagal menyimpan, coba lagi", "error");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={saved}
        aria-label={saved ? "Hapus dari simpanan" : "Simpan lowongan"}
        className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition-colors disabled:opacity-50 ${
          saved
            ? "border-coffee bg-[#efe9d9] text-espresso"
            : "border-[#e0d5bd] text-espresso hover:border-coffee"
        }`}
      >
        <Bookmark size={15} className={saved ? "fill-[#3d2c1e]" : ""} aria-hidden="true" />
          {saved ? "Tersimpan" : "Simpan"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Hapus dari simpanan" : "Simpan lowongan"}
      title={saved ? "Tersimpan — klik untuk hapus" : "Simpan lowongan"}
      className="text-espresso hover:text-caramel disabled:opacity-50"
    >
      <Bookmark size={15} className={saved ? "fill-[#c98a2b] text-[#c98a2b]" : ""} aria-hidden="true" />
    </button>
  );
}
