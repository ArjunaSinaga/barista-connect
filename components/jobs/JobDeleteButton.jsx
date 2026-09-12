"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export default function JobDeleteButton({ jobId, jobTitle, variant = "link" }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Hapus lowongan "${jobTitle}"? Semua lamaran ikut terhapus.`)) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("job_posts").delete().eq("id", jobId);
      if (error) throw error;
      toast("Lowongan dihapus");
      router.push("/dashboard/owner");
      router.refresh();
    } catch {
      toast("Gagal hapus lowongan", "error");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 size={14} /> {busy ? "Menghapus..." : "Hapus Lowongan"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      <Trash2 size={14} /> {busy ? "..." : "Hapus"}
    </button>
  );
}
