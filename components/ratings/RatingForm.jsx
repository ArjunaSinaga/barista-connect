"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function nextEditableAt(updatedAt) {
  return new Date(new Date(updatedAt).getTime() + WEEK_MS);
}

export function canEdit(updatedAt) {
  if (!updatedAt) return true;
  return Date.now() - new Date(updatedAt).getTime() >= WEEK_MS;
}

export function Stars({ value, size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= value ? "fill-amber-400 text-amber-400" : "text-latte"}
        />
      ))}
    </span>
  );
}

export default function RatingForm({ applicationId, jobPostId, ownerId, baristaId, existing }) {
  const toast = useToast();
  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(existing ?? null);

  const editable = canEdit(saved?.updated_at);
  const nextDate = saved ? nextEditableAt(saved.updated_at) : null;

  async function handleSave() {
    if (!stars) {
      toast("Pilih bintang 1–5 dulu", "error");
      return;
    }
    if (comment.length > 500) {
      toast("Komentar maksimal 500 karakter", "error");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      if (saved) {
        const { error } = await supabase
          .from("ratings")
          .update({ stars, comment })
          .eq("id", saved.id);
        if (error) throw error;
        toast("Rating diperbarui ✓ (bisa diubah lagi minggu depan)");
      } else {
        const { data, error } = await supabase
          .from("ratings")
          .insert({
            application_id: applicationId,
            job_post_id: jobPostId,
            owner_id: ownerId,
            barista_id: baristaId,
            stars,
            comment,
          })
          .select()
          .single();
        if (error) throw error;
        setSaved(data);
        toast("Rating tersimpan, makasih! ✓");
      }
      if (saved) {
        setSaved({ ...saved, stars, comment, updated_at: new Date().toISOString() });
      }
    } catch {
      toast("Gagal menyimpan rating", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-cream/60 border border-latte p-3">
      <p className="text-xs font-black text-espresso uppercase tracking-widest">
        {saved ? "Rating kamu" : "Kasih rating"}
      </p>
      {saved && !editable ? (
        <div className="mt-2">
          <Stars value={saved.stars} />
          {saved.comment && (
            <p className="mt-1 text-sm text-espresso">“{saved.comment}”</p>
          )}
          <p className="mt-1 text-[11px] text-espresso-soft">
            Bisa diubah lagi setelah{" "}
            {nextDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}.
          </p>
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStars(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${s} bintang`}
              >
                <Star
                  size={22}
                  className={
                    s <= (hover || stars)
                      ? "fill-amber-400 text-amber-400"
                      : "text-latte hover:text-amber-300"
                  }
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Komentar (opsional, mis. rajin, latte art rapi...)"
            className="mt-2 w-full rounded-lg border border-latte bg-white px-3 py-2 text-sm text-espresso placeholder:text-espresso-soft/50 focus:border-caramel focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-espresso-soft">{comment.length}/500 · bisa diubah seminggu sekali</span>
            <Button size="sm" disabled={busy} onClick={handleSave}>
              {busy ? "Menyimpan..." : saved ? "Perbarui rating" : "Simpan rating"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
