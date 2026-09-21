"use client";

import { CheckCircle2, Circle, X } from "lucide-react";

// Popup daftar bagian profil yang belum lengkap.
// Props: open, onClose, items [{key,label,done,target}], onAction(target) — pindah tab tengah.
export default function ProfileCompleteModal({ open, onClose, items = [], onAction }) {
  if (!open) return null;
  const missing = items.filter((i) => !i.done);
  const go = (target) => {
    onClose?.();
    onAction?.(target);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-md rounded-2xl border border-[#e8e0cf] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-espresso">Lengkapi Profil Bisnis</h3>
            <p className="mt-0.5 text-xs text-espresso-soft">
              {missing.length ? `${missing.length} bagian lagi menuju 100%` : "Semua lengkap — profil 100% 🎉"}
            </p>
          </div>
          <button onClick={onClose} aria-label="Tutup popup" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0d5bd] text-espresso-soft hover:text-espresso">
            <X size={15} />
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {items.map((it) => (
            <li key={it.key} className="flex items-center justify-between gap-2 rounded-xl border border-[#efe9d9] px-3 py-2">
              <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-espresso">
                {it.done ? <CheckCircle2 size={15} className="shrink-0 text-matcha" /> : <Circle size={15} className="shrink-0 text-[#b8a888]" />}
                <span className="truncate">{it.label}</span>
              </span>
              {!it.done && (
                <button
                  type="button"
                  onClick={() => go(it.target)}
                  className="shrink-0 rounded-full bg-coffee px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#2e2015]"
                >
                  Lengkapi
                </button>
              )}
            </li>
          ))}
        </ul>
        {!!missing.length && (
          <button
            type="button"
            onClick={() => go(missing[0].target)}
            className="mt-3 w-full rounded-full bg-[#1f6b4a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#17573c]"
          >
            Lengkapi Sekarang
          </button>
        )}
      </div>
    </div>
  );
}
