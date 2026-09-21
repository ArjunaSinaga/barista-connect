"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Power } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Toggle Aktif/Nonaktif satu klik per baris lowongan (reversibel, tanpa konfirmasi).
export default function JobActiveToggle({ jobId, isActive }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("job_posts").update({ is_active: !isActive }).eq("id", jobId);
      if (error) throw error;
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={isActive ? "Nonaktifkan lowongan" : "Aktifkan lagi lowongan"}
      aria-label={isActive ? "Nonaktifkan lowongan" : "Aktifkan lagi lowongan"}
      aria-pressed={isActive}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-bold transition-colors disabled:opacity-50 ${
        isActive
          ? "border-[#e0d5bd] text-espresso-soft hover:border-coffee hover:text-espresso"
          : "border-[#1f6b4a] bg-[#e3f0e8] text-matcha hover:bg-[#d2e7da]"
      }`}
    >
      <Power size={12} aria-hidden="true" />
      {busy ? "..." : isActive ? "Nonaktifkan" : "Aktifkan"}
      {failed && <span className="font-semibold text-red-700">· gagal, coba lagi</span>}
    </button>
  );
}
