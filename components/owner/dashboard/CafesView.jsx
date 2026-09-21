import Link from "next/link";
import Image from "next/image";
import { Plus, Store } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import CafeInvite from "@/components/owner/dashboard/CafeInvite";

// Kolom tengah mode cafes: daftar cafe owner.
export default function CafesView({ cafes, countByCafe, teamCountByCafe = {}, canAdd = true, onBack }) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">Owner</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">Cafe Saya ({cafes?.length ?? 0})</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-espresso-soft">Daftarkan semua cabangmu. Lowongan dipasang per cafe.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-white px-4 py-2 text-xs font-bold text-espresso hover:border-coffee"
          >
            <Store size={14} /> Dashboard
          </button>
          {canAdd && (
          <Link href="/dashboard/owner/cafes/new" className="inline-flex items-center gap-2 rounded-full bg-coffee px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]">
            <Plus size={14} /> Tambah Cafe
          </Link>
          )}
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
              <div className="flex items-center gap-4 rounded-2xl border border-[#e8e0cf] bg-white p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-coffee">
                {c.photo_urls?.[0] ? (
                  <Image src={c.photo_urls[0]} alt={c.name} width={56} height={56} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#efe9d9] text-[#9a6a2f]">
                    <Store size={22} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-espresso">
                    {c.name}{" "}
                    <Link href={`/dashboard/owner/cafes/${c.id}/edit`} className="font-bold text-link hover:underline">
                      Edit
                    </Link>
                  </p>
                  <p className="truncate text-[11px] text-espresso-soft">
                    {c.location || "-"} • {countByCafe[c.id] || 0} lowongan aktif
                    {c.photo_urls?.length > 1 && ` • ${c.photo_urls.length} foto`}
                  </p>
                  <p className="truncate text-[11px] text-espresso-soft">
                    {teamCountByCafe[c.id] ?? 0} anggota tim ·{" "}
                    <Link href={`/dashboard/owner?tab=team&cafe=${c.id}`} className="font-bold text-link hover:underline">
                      Lihat tim
                    </Link>
                  </p>
                  <CafeInvite cafeId={c.id} initialCode={c.invite_code} />
                </div>
                {!c.is_active && (
                  <span className="shrink-0 rounded-full bg-[#efe9d9] px-2 py-1 text-[11px] font-bold text-espresso-soft">Nonaktif</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
