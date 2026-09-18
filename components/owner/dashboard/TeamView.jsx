"use client";

import { useState } from "react";
import Link from "next/link";
import { UsersRound } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stars } from "@/components/ratings/RatingForm";
import TeamRemoveButton from "@/components/owner/TeamRemoveButton";
import { groupTeamByBarista, countTeamByCafe } from "@/lib/team";
import { formatExpShort } from "@/lib/exp";

const TEAM_META = {
  active: { label: "Aktif", classes: "bg-green-100 text-green-700" },
  terminated: { label: "Keluar", classes: "bg-gray-200 text-gray-600" },
};

export default function TeamView({ cafes = [], members = [], ratingMap = {}, initialCafeId = null, onBack }) {
  const cafeIds = new Set((cafes ?? []).map((c) => c.id));
  const [activeCafe, setActiveCafe] = useState(initialCafeId && cafeIds.has(initialCafeId) ? initialCafeId : null);
  const inCafe = (members ?? []).filter((m) => !activeCafe || m.cafe_id === activeCafe);
  const countByCafe = countTeamByCafe(members);
  const grouped = groupTeamByBarista(inCafe);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#857768] uppercase">Owner</p>
          <h2 className="font-display mt-0.5 text-2xl font-semibold tracking-tight">Tim Saya ({grouped.length})</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-5 text-[#6f6252]">Satu baris per orang. Klik cafe untuk melihat siapa saja yang bekerja di sana.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-2 text-xs font-bold text-[#3d2c1e] hover:border-[#3d2c1e]">
            <UsersRound size={14} /> Dashboard
          </button>
          <Link href="/dashboard/owner/team" className="inline-flex items-center gap-2 rounded-full bg-[#3d2c1e] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]">
            Halaman Tim
          </Link>
        </div>
      </div>

      {(cafes ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCafe(null)}
            className={`rounded-full px-4 py-2 text-xs font-bold border transition ${!activeCafe ? "bg-[#3d2c1e] text-white border-[#3d2c1e]" : "border-[#e0d5bd] bg-[#ffffff] text-[#6f6252] hover:border-[#3d2c1e]"}`}
          >
            Semua ({(members ?? []).length})
          </button>
          {(cafes ?? []).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCafe(c.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold border transition ${activeCafe === c.id ? "bg-[#3d2c1e] text-white border-[#3d2c1e]" : "border-[#e0d5bd] bg-[#ffffff] text-[#6f6252] hover:border-[#3d2c1e]"}`}
            >
              {c.name} ({countByCafe[c.id] ?? 0})
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {grouped.length === 0 && (
          <EmptyState
            icon={<UsersRound size={22} />}
            title="Belum ada pekerja"
            subtitle={activeCafe ? "Belum ada pekerja di cafe ini." : "Belum ada pelamar yang diterima."}
            actionLabel="Lihat Lowongan"
            actionHref="/dashboard/owner"
          />
        )}
        {grouped.map((g) => {
          const b = g.profile;
          const meta = g.isActive ? TEAM_META.active : TEAM_META.terminated;
          return (
            <div key={g.baristaId} className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
              <div className="flex items-center gap-4">
                <Avatar src={b?.profile_picture_url} name={b?.full_name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="truncate text-sm font-extrabold text-[#2b2118]">{b?.full_name ?? "Barista"}</span>
                    <Badge classes={meta.classes}>{meta.label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#857768]">
                    {b?.location_place ?? "-"} • {formatExpShort(b?.experience_months, b?.years_of_experience)} pengalaman • {g.jobs.length} lowongan
                  </p>
                </div>
                <Link href={`/barista/${b?.id}`} className="shrink-0 text-xs font-bold text-[#6f6252] hover:text-[#3d2c1e]">
                  Profil →
                </Link>
                <TeamRemoveButton memberIds={g.memberIds} name={b?.full_name ?? "Barista"} />
              </div>
              <ul className="mt-3 space-y-2 border-t border-[#e8e0cf] pt-3">
                {g.jobs.map((m) => {
                  const r = ratingMap[m.id] ?? null;
                  const jm = TEAM_META[m.status] ?? TEAM_META.active;
                  return (
                    <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate text-[#857768]">
                        <span className="font-bold text-[#2b2118]">{m.job_title || "Lowongan"}</span>
                        {m.cafes?.name && <> · {m.cafes.name}</>}
                        {" "}· <Badge classes={jm.classes}>{jm.label}</Badge>
                      </span>
                      {r ? (
                        <span className="inline-flex shrink-0 items-center gap-1.5">
                          <Stars value={r.stars} size={12} />
                        </span>
                      ) : m.application_id && m.job_post_id ? (
                        <Link href={`/dashboard/owner/jobs/${m.job_post_id}/applicants`} className="shrink-0 font-bold text-[#2b6cb0] hover:underline">
                          Kasih rating →
                        </Link>
                      ) : (
                        <Link href={`/barista/${b?.id}`} className="shrink-0 font-bold text-[#2b6cb0] hover:underline">
                          Nilai di profil →
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
