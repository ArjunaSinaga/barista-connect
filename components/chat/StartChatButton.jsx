"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export default function StartChatButton({
  ownerId,
  baristaId,
  full = false,
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: cid, error } = await supabase.rpc(
        "get_or_create_conversation",
        { p_owner: ownerId, p_barista: baristaId }
      );
      if (error || !cid) throw error;
      router.push(`/messages/${cid}`);
    } catch {
      toast("Gagal membuka percakapan", "error");
      setBusy(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={busy} full={full}>
      <MessageSquareText size={15} />
      {busy ? "Membuka..." : "Chat"}
    </Button>
  );
}
