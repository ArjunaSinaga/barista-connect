"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export default function ApplyButton({
  jobId,
  applied = false,
  size = "md",
  full = false,
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(applied);

  async function handleClick() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=/jobs/${jobId}`);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "barista") {
      toast("Hanya akun barista yang bisa melamar", "error");
      return;
    }
    setOpen(true);
  }

  async function submitApplication() {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("applications").insert({
        job_post_id: jobId,
        message: message.trim(),
      });
      if (error) {
        if (error.code === "23505") {
          toast("Kamu sudah pernah melamar lowongan ini");
        } else {
          throw error;
        }
      } else {
        toast("Lamaran terkirim!");
      }
      setDone(true);
      setOpen(false);
    } catch {
      toast("Gagal mengirim lamaran, coba lagi", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        onClick={handleClick}
        size={size}
        full={full}
        variant={done ? "secondary" : "primary"}
        disabled={done}
      >
        {done ? "✓ Terkirim" : "Lamar"}
      </Button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Kirim Lamaran">
        <p className="mb-4 text-sm text-espresso-soft">
          Sertakan pesan singkat untuk pemilik coffee shop (opsional).
        </p>
        <Textarea
          name="application_message"
          value={message}
          maxLength={300}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Contoh: Halo, saya berpengalaman 2 tahun di espresso bar dan bisa latte art..."
        />
        <div className="mt-1 mb-4 text-right text-[11px] text-espresso-soft">
          {message.length}/300
        </div>
        <Button onClick={submitApplication} full disabled={busy}>
          <Send size={16} />
          {busy ? "Mengirim..." : "Kirim Lamaran"}
        </Button>
      </Sheet>
    </>
  );
}
