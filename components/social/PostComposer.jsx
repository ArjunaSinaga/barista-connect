"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, Send, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FEED_POST_MIME_TYPES, FEED_POST_MAX_BYTES, FEED_CAPTION_MAX } from "@/lib/constants";
import { compressImage } from "@/lib/image";
import { useToast } from "@/components/ui/toast";

// C3: komposer postingan feed — foto opsional + caption, default publik.
export default function PostComposer() {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(null); // {file, url}
  const [posting, setPosting] = useState(false);

  function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!FEED_POST_MIME_TYPES.includes(file.type)) {
      toast("Format harus JPG, PNG, atau WebP", "error");
      return;
    }
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview({ file, url: URL.createObjectURL(file) });
  }

  async function post() {
    const text = caption.trim();
    if (!text && !preview) {
      toast("Tulis caption atau pilih foto dulu", "error");
      return;
    }
    if (text.length > FEED_CAPTION_MAX) {
      toast(`Caption maks ${FEED_CAPTION_MAX} karakter`, "error");
      return;
    }
    setPosting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("belum masuk");
      let imageUrl = null;
      if (preview) {
        const blob = await compressImage(preview.file);
        if (blob.size > FEED_POST_MAX_BYTES) throw new Error("kegedean");
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("feed-posts")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (upErr) throw upErr;
        imageUrl = supabase.storage.from("feed-posts").getPublicUrl(path).data.publicUrl;
      }
      const { error: insErr } = await supabase
        .from("barista_posts")
        .insert({ barista_id: user.id, image_url: imageUrl, caption: text });
      if (insErr) throw insErr;
      setCaption("");
      if (preview?.url) URL.revokeObjectURL(preview.url);
      setPreview(null);
      toast("Postingan tayang di feed publik", "success");
      router.refresh();
    } catch (e) {
      toast(e.message === "kegedean" ? "Foto terlalu besar (maks 10MB)" : "Gagal memposting, coba lagi", "error");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-2xl card-dark p-5">
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={3}
        maxLength={FEED_CAPTION_MAX + 50}
        placeholder="Pamer kreasi terbarumu… (latte art, racikan baru, keseruan di bar)"
        className="w-full resize-none rounded-xl border border-latte bg-cream px-4 py-3 text-sm text-espresso outline-none placeholder:text-espresso-soft/70 focus:border-caramel"
      />
      {preview && (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-latte">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.url} alt="Pratinjau postingan" className="max-h-72 w-full object-cover" />
          <button
            type="button"
            onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null); }}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            title="Hapus foto"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-espresso-soft">
          {caption.trim().length}/{FEED_CAPTION_MAX} • Tayang publik
        </span>
        <span className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-latte px-4 py-2 text-sm font-bold text-espresso hover:border-caramel hover:text-caramel"
          >
            <ImagePlus size={15} /> Foto
          </button>
          <button
            type="button"
            disabled={posting}
            onClick={post}
            className="inline-flex items-center gap-1.5 rounded-xl bg-coffee px-4 py-2 text-sm font-bold text-white hover:bg-[#2e2015] disabled:opacity-60"
          >
            {posting ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />} Posting
          </button>
        </span>
      </div>
    </div>
  );
}
