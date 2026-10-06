"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// ponytail: kelola partner_cafe_ids (relasi beneran ke cafes) via update own.
export default function PartnerManager({ academyId, partners, cafes }) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const ids = new Set(partners.map((c) => c.id));
  const matches = q.trim()
    ? (cafes ?? []).filter((c) => !ids.has(c.id) && `${c.name} ${c.location ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5)
    : [];

  async function save(next) {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("academy_profiles")
        .update({ partner_cafe_ids: next, updated_at: new Date().toISOString() })
        .eq("id", academyId);
      if (error) throw error;
      router.refresh();
    } catch {
      toast("Gagal menyimpan kafe partner", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {partners.length === 0 && (
        <p className="text-xs text-espresso-soft">Belum ada kafe partner. Cari di bawah untuk menambah.</p>
      )}
      <ul className="space-y-2">
        {partners.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#e8e0cf] bg-white px-3 py-2 text-xs">
            <span className="min-w-0 truncate">
              <span className="font-bold text-espresso">{c.name}</span>
              {c.location && <span className="text-espresso-soft"> · {c.location}</span>}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => save(partners.map((p) => p.id).filter((id) => id !== c.id))}
              className="shrink-0 font-bold text-red-600 hover:underline disabled:opacity-50"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <label htmlFor="partner-q" className="sr-only">Cari kafe partner</label>
        <input
          id="partner-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama kafe..."
          autoComplete="off"
          className="h-9 w-full rounded-full border border-[#e0d5bd] bg-white px-3 text-xs text-espresso outline-none placeholder:text-[#b6a98f] focus:border-coffee"
        />
        {matches.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { save([...partners.map((p) => p.id), c.id]); setQ(""); }}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-[#d8cdae] px-3 py-2 text-left text-xs hover:border-coffee disabled:opacity-50"
                >
                  <span className="min-w-0 truncate text-espresso">
                    {c.name}{c.location && <span className="text-espresso-soft"> · {c.location}</span>}
                  </span>
                  <span className="shrink-0 font-bold text-matcha">+ Tambah</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
