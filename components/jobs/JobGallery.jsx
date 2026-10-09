"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { thumb } from "@/lib/img";

// T-02/T-03: strip foto + tombol "Lihat N foto" -> modal galeri (Esc tutup, panah navigasi).
export default function JobGallery({ photos, cafeName }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const total = photos.length;

  const close = useCallback(() => setOpen(false), []);
  const step = useCallback(
    (d) => setIdx((i) => (i + d + total) % total),
    [total]
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  if (!total) return null;

  return (
    <div>
      <div className={`grid gap-1.5 overflow-hidden rounded-2xl ${total > 1 ? "grid-cols-3" : "grid-cols-1"}`}>
        {photos.slice(0, 3).map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => { setIdx(i); setOpen(true); }}
            className={`relative block h-40 w-full overflow-hidden sm:h-52 ${total > 1 && i === 0 ? "col-span-2" : ""}`}
            aria-label={`Lihat foto ${i + 1}`}
          >
            <Image src={thumb(src, { w: 800 })} alt={i === 0 ? `Suasana ${cafeName}` : `Foto ${cafeName} ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform" sizes="(max-width: 768px) 100vw, 800px" />
            {i === 2 && total > 3 && (
              <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 text-sm font-bold text-white">
                <Expand size={15} /> Lihat {total} foto
              </span>
            )}
          </button>
        ))}
      </div>
      {total > 3 && (
        <button type="button" onClick={() => { setIdx(0); setOpen(true); }} className="mt-2 text-xs font-bold text-link hover:underline">
          Lihat {total} foto
        </button>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Galeri foto" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={close}>
          <button type="button" onClick={close} aria-label="Tutup galeri" className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X size={18} />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Foto sebelumnya" className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6">
            <ChevronLeft size={20} />
          </button>
          <div className="relative h-[70vh] w-full max-w-3xl overflow-hidden rounded-xl" onClick={(e) => e.stopPropagation()}>
            <Image src={thumb(photos[idx], { w: 1200 })} alt={`Foto ${cafeName} ${idx + 1} dari ${total}`} fill className="object-contain" sizes="100vw" />
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Foto berikutnya" className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6">
            <ChevronRight size={20} />
          </button>
          <p className="absolute bottom-4 text-xs font-bold text-white tabular-nums">{idx + 1} / {total}</p>
        </div>
      )}
    </div>
  );
}
