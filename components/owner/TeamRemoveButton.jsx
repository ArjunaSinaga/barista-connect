"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export default function TeamRemoveButton({ memberId, memberIds, name }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const ids = memberIds?.length ? memberIds : memberId ? [memberId] : [];

  async function handleRemove() {
    if (!ids.length) return;
    if (!confirm(`Hapus ${name} dari Tim Saya? Riwayat rating yang sudah diberikan tetap tersimpan di profilnya.`)) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("team_members").delete().in("id", ids);
      if (error) throw error;
      toast("Anggota tim dihapus");
      router.refresh();
    } catch {
      toast("Gagal menghapus anggota tim", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={busy || !ids.length}
      title="Hapus dari tim"
      aria-label="Hapus dari tim"
      className="shrink-0 rounded-full p-2 text-espresso-soft/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <UserMinus size={16} />
    </button>
  );
}
