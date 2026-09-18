import Link from "next/link";
import { Plus, Store } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import CafeInvite from "@/components/owner/dashboard/CafeInvite";

// Kolom tengah mode cafes: daftar cafe owner.
export default function CafesView({ cafes, countByCafe, teamCountByCafe = {}, onBack }) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">Owner</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">Cafe Saya ({cafes?.length ?? 0})</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-[#6f6252]">Daftarkan semua cabangmu. Lowongan dipasang per cafe.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#3d2c1e] hover:border-[#3d2c1e]"
          >
            <Store size={14} /> Dashboard
          </button>
          <Link href="/dashboard/owner/cafes/new" className="inline-flex items-center gap-2 rounded-full bg-[#3d2c1e] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]">
            <Plus size={14} /> Tambah Cafe
          </Link>
        </div>
      </div>

      {!cafes?.length ? (
        <EmptyState
          icon={<Store size={22} />}
          title="Belum ada cafe"
          subtitle="Daftarkan cafe pertamamu dulu sebelum pasang lowongan."
          actionLabel="Daftarkan Cafe"
          actionHref="/dashboard/owner/cafes/new"
        />
      ) : (
        <ul className="space-y-3">
          {(cafes ?? []).map((c) => (
            <li key={c.id}>
              <div className="flex items-center gap-4 rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-[#3d2c1e]">
                {c.photo_urls?.[0] ? (
                  <img src={c.photo_urls[0]} alt={c.name} loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#efe9d9] text-[#9a6a2f]">
                    <Store size={22} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#2b2118]">
                    {c.name}{" "}
                    <Link href={`/dashboard/owner/cafes/${c.id}/edit`} className="font-bold text-[#2b6cb0] hover:underline">
                      Edit
                    </Link>
                  </p>
                  <p className="truncate text-[11px] text-[#857768]">
                    {c.location || "-"} • {countByCafe[c.id] || 0} lowongan aktif
                    {c.photo_urls?.length > 1 && ` • ${c.photo_urls.length} foto`}
                  </p>
                  <p className="truncate text-[11px] text-[#857768]">
                    {teamCountByCafe[c.id] ?? 0} anggota tim ·{" "}
                    <Link href={`/dashboard/owner?tab=team&cafe=${c.id}`} className="font-bold text-[#2b6cb0] hover:underline">
                      Lihat tim
                    </Link>
                  </p>
                  <CafeInvite cafeId={c.id} initialCode={c.invite_code} />
                </div>
                {!c.is_active && (
                  <span className="shrink-0 rounded-full bg-[#efe9d9] px-2 py-1 text-[11px] font-bold text-[#857768]">Nonaktif</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
