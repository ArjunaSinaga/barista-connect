"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, MapPin, Briefcase, Send, ChevronRight, ChevronLeft } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import SaveBaristaButton from "@/components/owner/dashboard/SaveBaristaButton";
import InviteButton from "@/components/owner/dashboard/InviteButton";
import { avgStars } from "@/lib/ratings";

// Kartu kandidat ala mockup: foto + badge + nama + rating + quote + skill + 2 CTA.
export function badgeFor(b, rank) {
  if (b.is_open_to_work) return { label: "Available Now", cls: "bg-[#e3f0e8] text-[#1f6b4a]" };
  if ((b.certificates?.length ?? 0) > 0) return { label: "Certified", cls: "bg-[#e3f0e8] text-[#1f6b4a]" };
  if (rank === 0) return { label: "Top 1%", cls: "bg-[#f5ecd4] text-[#8a6d1f]" };
  return { label: "Top Match", cls: "bg-[#f5ecd4] text-[#8a6d1f]" };
}

export function CandidateCard({ barista, rank, compact = false, strip = false, saved = false, ownerId = null }) {
  const avg = avgStars(barista.ratings);
  const count = barista.ratings?.length ?? 0;
  const badge = badgeFor(barista, rank ?? 99);
  const photo = barista.profile_picture_url;
  const quote = barista.cover_letter || barista.ideas_plus;

  if (strip) {
    return (
      <div className="flex h-full min-w-0 items-center gap-3 rounded-xl border border-[#e8e0cf] bg-[#ffffff] p-2.5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#efe9d9]">
          {photo ? (
            <img src={photo} alt={barista.full_name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Avatar name={barista.full_name} size="sm" />
            </div>
          )}
          <span className={`absolute top-1 left-1 rounded px-1.5 py-0.5 text-[8px] font-bold ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="flex items-center gap-1 text-xs font-extrabold text-[#2b2118] truncate">
              <span className="truncate">{barista.full_name}</span>
              {barista.is_verified && <VerifiedBadge size={11} />}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#2b2118]">
                <Star size={10} className="fill-[#c98a2b] text-[#c98a2b]" />
                {avg ?? "-"} <span className="font-semibold text-[#857768]">({count})</span>
              </span>
              <SaveBaristaButton baristaId={barista.id} baristaName={barista.full_name} initialSaved={saved} />
            </div>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-[#857768]">
            <span className="inline-flex items-center gap-0.5"><MapPin size={9} />{barista.location_place ?? "-"}</span>
            <span className="inline-flex items-center gap-0.5"><Briefcase size={9} />{barista.years_of_experience ?? 0} thn</span>
          </p>
          {quote && (
            <p className="mt-0.5 line-clamp-1 text-[10px] leading-3 text-[#857768] italic">
              &ldquo;{quote}&rdquo;
            </p>
          )}
          <div className="mt-1 flex items-center gap-1.5">
            {barista.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {barista.skills.slice(0, 2).map((s) => (
                  <span key={s} className="rounded bg-[#f2ecdf] px-1.5 py-0.5 text-[9px] font-semibold text-[#6f6252]">{s}</span>
                ))}
              </div>
            )}
            <div className="ml-auto flex gap-1">
              <Link
                href={`/barista/${barista.id}`}
                className="inline-flex items-center justify-center rounded border border-[#d8cdae] px-2 py-1 text-[10px] font-bold text-[#3d2c1e] hover:border-[#3d2c1e]"
              >
                Profile
              </Link>
              <InviteButton
                ownerId={ownerId}
                baristaId={barista.id}
                iconSize={9}
                className="inline-flex items-center justify-center gap-0.5 rounded bg-[#3d2c1e] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#2e2015] disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const coverCls = compact ? "aspect-[16/7]" : "aspect-[16/8]";

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#ffffff] shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <div className="relative">
        {photo ? (
          <img src={photo} alt={barista.full_name} loading="lazy" className={`${coverCls} w-full object-cover`} />
        ) : (
          <div className={`flex ${coverCls} w-full items-center justify-center bg-[#efe9d9]`}>
            <Avatar name={barista.full_name} size="lg" />
          </div>
        )}
        <span className={`absolute top-2 left-2 rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}>
          {badge.label}
        </span>
        <SaveBaristaButton baristaId={barista.id} baristaName={barista.full_name} initialSaved={saved} />
      </div>
      <div className={compact ? "flex flex-1 flex-col p-2.5" : "p-3"}>
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-[#2b2118]">
          <span className="truncate">{barista.full_name}</span>
          {barista.is_verified && <VerifiedBadge size={13} />}
        </p>
        <p className="text-[11px] text-[#857768]">Barista</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#857768]">
          <span className="inline-flex items-center gap-1"><MapPin size={10} />{barista.location_place ?? "-"}</span>
          <span className="inline-flex items-center gap-1"><Briefcase size={10} />{barista.years_of_experience ?? 0} thn</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#2b2118]">
          <Star size={11} className="fill-[#c98a2b] text-[#c98a2b]" />
          {avg ?? "-"} <span className="font-semibold text-[#857768]">({count})</span>
        </p>
        {quote && (
          <p className={compact
            ? "mt-1 line-clamp-1 text-[11px] leading-4 text-[#857768] italic"
            : "mt-1.5 line-clamp-2 text-[11px] leading-4 text-[#857768] italic"}>
            &ldquo;{quote.slice(0, compact ? 60 : 90)}&rdquo;
          </p>
        )}
        {barista.skills?.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {barista.skills.slice(0, compact ? 2 : 3).map((s) => (
              <span key={s} className="rounded-full bg-[#f2ecdf] px-2 py-0.5 text-[10px] font-semibold text-[#6f6252]">{s}</span>
            ))}
            {barista.skills.length > (compact ? 2 : 3) && (
              <span className="rounded-full bg-[#f2ecdf] px-2 py-0.5 text-[10px] font-semibold text-[#6f6252]">+{barista.skills.length - (compact ? 2 : 3)}</span>
            )}
          </div>
        )}
        <div className="mt-1.5 flex gap-1.5">
          <Link
            href={`/barista/${barista.id}`}
            className="inline-flex min-h-[34px] flex-1 items-center justify-center rounded-full border border-[#d8cdae] px-2 py-1.5 text-[11px] font-bold text-[#3d2c1e] hover:border-[#3d2c1e]"
          >
            View Profile
          </Link>
          <InviteButton
            ownerId={ownerId}
            baristaId={barista.id}
            iconSize={11}
            className="inline-flex min-h-[34px] flex-1 items-center justify-center gap-1 rounded-full bg-[#3d2c1e] px-2 py-1.5 text-[11px] font-bold text-white hover:bg-[#2e2015] disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}

// Strip terbatas: kartu full (compact-pendek) dalam 1 baris carousel + panah.
// Dipakai persisten di bawah tab active/pelamar — halaman tidak memanjang.
export function TopCandidatesStrip({ baristas, savedIds = [], ownerId = null }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const nudge = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * 280, behavior: reduce ? "auto" : "smooth" });
  };

  if (!baristas?.length) return null;
  const arrow = (enabled) =>
    `flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
      enabled
        ? "border-[#e0d5bd] bg-[#ffffff] text-[#3d2c1e] hover:border-[#3d2c1e]"
        : "cursor-not-allowed border-[#efe9d9] bg-[#faf7ef] text-[#b6a98f]"
    }`;

  return (
    <section aria-label="Top candidates" className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-[#2b2118]">Top Candidates</h2>
          <p className="text-[11px] text-[#857768]">Barista pilihan untuk cafe Anda. Geser untuk lihat.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => nudge(-1)} disabled={!canLeft} aria-label="Geser kandidat ke kiri" className={arrow(canLeft)}>
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => nudge(1)} disabled={!canRight} aria-label="Geser kandidat ke kanan" className={arrow(canRight)}>
            <ChevronRight size={15} aria-hidden="true" />
          </button>
          <Link href="/find-baristas" className="ml-1 inline-flex items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
            Lihat semua <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div
        ref={trackRef}
        onScroll={update}
        tabIndex={0}
        role="region"
        aria-label="Daftar top candidates, geser horizontal"
        className="mt-2 flex snap-x gap-2.5 overflow-x-auto overscroll-x-contain pb-1 no-scrollbar"
      >
        {baristas.map((b, i) => (
          <div key={b.id} className="w-[280px] shrink-0 snap-start sm:w-[300px]">
            <CandidateCard barista={b} rank={i} strip saved={savedIds.includes(b.id)} ownerId={ownerId} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Grid penuh untuk view talenta: top 3 langsung kelihatan semua, tanpa geser.
// Mobile menumpuk vertikal, desktop 3 sejajar (lebar kartu ikut ruang).
export function TopCandidatesGrid({ baristas, savedIds = [], ownerId = null }) {
  if (!baristas?.length) return null;
  return (
    <section aria-label="Top candidates">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-[#2b2118]">Top Candidates</h2>
          <p className="text-[11px] text-[#857768]">Barista pilihan untuk cafe Anda.</p>
        </div>
        <Link href="/find-baristas" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
          Lihat semua talenta <ChevronRight size={13} aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-2 grid gap-3 md:grid-cols-3">
        {baristas.map((b, i) => (
          <CandidateCard key={b.id} barista={b} rank={i} compact saved={savedIds.includes(b.id)} ownerId={ownerId} />
        ))}
      </div>
    </section>
  );
}

// Baris ringkas untuk kolom kanan (Recommended / Certified).
export function TalentRow({ barista, tag }) {
  const avg = avgStars(barista.ratings);
  const count = barista.ratings?.length ?? 0;
  return (
    <Link href={`/barista/${barista.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#faf7ef]">
      <Avatar src={barista.profile_picture_url} name={barista.full_name} size="md" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[13px] font-extrabold text-[#2b2118]">{barista.full_name}</span>
          {tag && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tag.cls}`}>{tag.label}</span>
          )}
        </span>
        <span className="mt-0.5 block text-[11px] text-[#857768]">
          <Star size={10} className="mr-1 inline fill-[#c98a2b] text-[#c98a2b]" />
          {avg ?? "-"} ({count}) · {barista.years_of_experience ?? 0} tahun
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[#857768]">
          {barista.location_place ?? ""}{barista.skills?.length ? ` · ${barista.skills.slice(0, 2).join(", ")}` : ""}
        </span>
      </span>
      <ChevronRight size={15} className="shrink-0 text-[#b6a98f]" />
    </Link>
  );
}
