"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Users, UsersRound, Heart, Star, GraduationCap, Settings,
  Camera, Crown, ArrowRight,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ProfileCompleteModal from "@/components/owner/dashboard/ProfileCompleteModal";
import { snoozeCheck, snoozeHide } from "@/components/ui/useSnooze";

const NUDGE_KEY = "hide-profile-nudge";

// Sidebar dashboard owner ala mockup: kartu profil cafe + nav + upsell Pro.
// Semua angka dari props (data real), bukan hardcode.
export default function SidebarOwner({ cafe, ownerName, completeness, completenessItems = [], counts, view, onNavigate }) {
  const pathname = usePathname();
  const photo = cafe?.photo_urls?.[0] ?? null;
  const name = cafe?.name ?? ownerName ?? "Cafe Anda";
  const loc = cafe?.address ?? cafe?.location ?? "Lengkapi alamat cafe";
  const [modalOpen, setModalOpen] = useState(false);

  // Auto-popup sekali, lalu snooze 2x tampil-buka bila di-X
  // (klik X → hilang → refresh 1 tetap hilang → refresh 2 muncul lagi).
  useEffect(() => {
    if (completeness >= 100 || typeof window === "undefined") return;
    if (!snoozeCheck(NUDGE_KEY)) return;
    const t = setTimeout(() => setModalOpen(true), 800);
    return () => clearTimeout(t);
  }, [completeness]);

  const closeModal = () => {
    setModalOpen(false);
    snoozeHide(NUDGE_KEY);
  };

  const cls = (active) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold ${
      active ? "bg-[#efe9d9] text-[#3d2c1e]" : "text-[#6f6252] hover:bg-[#faf7ef] hover:text-[#3d2c1e]"
    }`;
  const countBadge = (n) =>
    n !== null && n !== undefined ? (
      <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-[#6f6252]">{n}</span>
    ) : null;

  const isMain = !pathname?.startsWith("/dashboard/owner/cafes") && !pathname?.startsWith("/dashboard/owner/profile");

  return (
    <aside className="flex min-w-0 flex-col gap-3 lg:h-full">
      <div className="shrink-0 rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <div className="relative mx-auto h-20 w-20">
          {photo ? (
            <img src={photo} alt={name} className="h-20 w-20 rounded-full border-4 border-[#efe9d9] object-cover" />
          ) : (
            <Avatar name={name} size="lg" />
          )}
          <Link
            href="/dashboard/owner/cafes"
            aria-label="Edit foto cafe"
            className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border border-[#e0d5bd] bg-[#ffffff] text-[#6f6252] hover:text-[#3d2c1e]"
          >
            <Camera size={13} />
          </Link>
        </div>
        <p className="mt-2 text-base font-extrabold tracking-tight text-[#2b2118]">{name}</p>
        <p className="mt-0.5 text-xs text-[#857768]">{loc}</p>
        <div className="mt-4 text-left">
          <p className="flex items-center justify-between text-xs font-bold text-[#2b2118]">
            Profil Bisnis <span>{completeness}%</span>
          </p>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#efe9d9]">
            <div className="h-full rounded-full bg-[#1f6b4a]" style={{ width: `${completeness}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-[#857768]">Lengkapi profil untuk menjangkau talenta terbaik.</p>
          {completeness < 100 ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-2 block w-full rounded-full bg-[#3d2c1e] px-4 py-2 text-center text-xs font-bold text-white hover:bg-[#2e2015]"
            >
              Lengkapi ke 100%
            </button>
          ) : null}
          <Link
            href="/dashboard/owner/profile"
            className="mt-2 block rounded-full bg-[#efe9d9] px-4 py-2 text-center text-xs font-bold text-[#3d2c1e] hover:bg-[#e5dcc4]"
          >
            Edit Profil
          </Link>
        </div>
      </div>

      <nav className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-2 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:flex-1">
        <button type="button" onClick={() => onNavigate?.("talenta")} className={cls(isMain && view === "talenta")}>
          <LayoutDashboard size={17} className="shrink-0" />
          <span className="flex-1 text-left">Dashboard</span>
        </button>
        <button type="button" onClick={() => onNavigate?.("active")} className={cls(isMain && view === "active")}>
          <Briefcase size={17} className="shrink-0" />
          <span className="flex-1 text-left">Loker Aktif</span>
          {countBadge(counts.activeJobs)}
        </button>
        <button type="button" onClick={() => onNavigate?.("pelamar")} className={cls(isMain && view === "pelamar")}>
          <Users size={17} className="shrink-0" />
          <span className="flex-1 text-left">Pelamar</span>
          {countBadge(counts.applicants)}
        </button>
        <button type="button" onClick={() => onNavigate?.("team")} className={cls(isMain && view === "team")}>
          <UsersRound size={17} className="shrink-0" />
          <span className="flex-1 text-left">Tim Saya</span>
          {countBadge(counts.team)}
        </button>
        <button type="button" onClick={() => onNavigate?.("saved")} className={cls(isMain && view === "saved")}>
          <Heart size={17} className="shrink-0" />
          <span className="flex-1 text-left">Kandidat Tersimpan</span>
          {countBadge(counts.saved)}
        </button>
        <button type="button" onClick={() => onNavigate?.("reviews")} className={cls(isMain && view === "reviews")}>
          <Star size={17} className="shrink-0" />
          <span className="flex-1 text-left">Ulasan Diberi</span>
          {countBadge(counts.reviewsGiven)}
        </button>
        <button type="button" onClick={() => onNavigate?.("cafes")} className={cls(isMain && view === "cafes")}>
          <Camera size={17} className="shrink-0" />
          <span className="flex-1 text-left">Kafe Saya</span>
          {countBadge(counts.cafes)}
        </button>
        <button type="button" onClick={() => onNavigate?.("settings")} className={cls(isMain && view === "settings")}>
          <Settings size={17} className="shrink-0" />
          <span className="flex-1 text-left">Pengaturan</span>
        </button>
        <Link
          href="/training"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-[#6f6252] hover:bg-[#faf7ef] hover:text-[#3d2c1e]"
        >
          <GraduationCap size={17} className="shrink-0" />
          <span className="flex-1">Pelatihan</span>
        </Link>
      </nav>

      <div className="relative shrink-0 rounded-2xl border border-[#e8e0cf] bg-[#efe9d9] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="flex items-center gap-2 text-sm font-extrabold text-[#3d2c1e]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3d2c1e] text-white"><Crown size={15} /></span>
          BaristaConnect Pro
        </p>
        <p className="mt-2 text-xs leading-5 text-[#6f6252]">
          Upgrade ke Pro untuk akses talenta prioritas, insight lebih dalam, dan fitur eksklusif.
        </p>
        <Link
          href="/verify"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#3d2c1e] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Upgrade Sekarang <ArrowRight size={13} />
        </Link>
      </div>
      <ProfileCompleteModal open={modalOpen} onClose={closeModal} items={completenessItems} onAction={(t) => onNavigate?.(t)} />
    </aside>
  );
}
