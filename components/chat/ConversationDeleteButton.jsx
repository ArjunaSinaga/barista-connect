"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export default function ConversationDeleteButton({ conversationId, name, variant = "icon" }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Hapus percakapan dengan ${name}? Semua pesan ikut terhapus dan tidak bisa dikembalikan.`)) return;
    setBusy(true);
    try {
      const supabase = createClient();
      // Hapus pesan dulu (agar pasti bersih), lalu percakapan
      await supabase.from("messages").delete().eq("conversation_id", conversationId);
      const { error } = await supabase.from("conversations").delete().eq("id", conversationId);
      if (error) throw error;
      toast("Percakapan dihapus");
      router.push("/messages");
      router.refresh();
    } catch {
      toast("Gagal menghapus percakapan", "error");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        title="Hapus percakapan"
        aria-label="Hapus percakapan"
        className="rounded-full p-2 bg-cream-dark text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      title="Hapus percakapan"
      aria-label="Hapus percakapan"
      className="shrink-0 rounded-full p-2 text-espresso-soft/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
