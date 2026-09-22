"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

// Invite nyata: buka/buat percakapan dengan barista lalu masuk ke thread.
// Tanpa ownerId (seharusnya tak terjadi di dashboard) → arahkan login.
export default function InviteButton({ ownerId, baristaId, className = "", iconSize = 10, label = "Undang" }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function invite() {
    if (busy) return;
    if (!ownerId) {
      router.push(`/login?next=/barista/${baristaId}`);
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: cid, error } = await supabase.rpc("get_or_create_conversation", {
        p_owner: ownerId,
        p_barista: baristaId,
      });
      if (error || !cid) throw error;
      router.push(`/messages/${cid}`);
    } catch {
      toast("Gagal mengirim undangan", "error");
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={invite} disabled={busy} aria-label={`Undang barista ke interview`} className={className}>
      <Send size={iconSize} aria-hidden="true" /> {busy ? "Membuka..." : label}
    </button>
  );
}
