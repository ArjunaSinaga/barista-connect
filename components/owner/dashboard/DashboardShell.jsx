"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SidebarOwner from "@/components/owner/dashboard/SidebarOwner";
import TalentaView from "@/components/owner/dashboard/TalentaView";
import ActiveJobsView from "@/components/owner/dashboard/ActiveJobsView";
import PelamarView from "@/components/owner/dashboard/PelamarView";
import ReviewsView from "@/components/owner/dashboard/ReviewsView";
import CafesView from "@/components/owner/dashboard/CafesView";
import SettingsView from "@/components/owner/dashboard/SettingsView";
import TeamView from "@/components/owner/dashboard/TeamView";
import { TalentRow, TopCandidatesStrip, TopCandidatesGrid } from "@/components/owner/dashboard/TopCandidates";
import { EmptyState } from "@/components/ui/EmptyState";
import { SmarterOpsCard } from "@/components/landing/SidebarKerja";

// Shell 3 kolom: sidebar tetap, hanya kolom TENGAH yang ganti
// (talenta/active/pelamar/reviews/cafes) tanpa navigasi halaman.
const VIEWS = ["talenta", "active", "pelamar", "reviews", "cafes", "settings", "saved", "team"];
const LEGACY = { lowongan: "active", tim: "team" }; // deep-link lama tetap jalan
export default function DashboardShell({ initialView = "talenta", initialCafeId = null, sidebar, middle, right }) {
  const start = LEGACY[initialView] ?? initialView;
  const [view, setView] = useState(VIEWS.includes(start) ? start : "talenta");
  return (
    <div className="grid items-start gap-4 lg:h-full lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_320px]">
      <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 no-scrollbar">
        <SidebarOwner {...sidebar} view={view} onNavigate={setView} />
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <div className="min-w-0 space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 lg:pb-1 no-scrollbar">
          {view === "active" ? (
            <ActiveJobsView {...middle.active} onBack={() => setView("talenta")} />
          ) : view === "pelamar" ? (
            <PelamarView {...middle.pelamar} onBack={() => setView("talenta")} />
          ) : view === "reviews" ? (
            <ReviewsView {...middle.reviews} onBack={() => setView("talenta")} />
          ) : view === "cafes" ? (
            <CafesView {...middle.cafes} teamCountByCafe={middle.teamCountByCafe ?? {}} onBack={() => setView("talenta")} />
          ) : view === "settings" ? (
            <SettingsView {...middle.settings} onBack={() => setView("talenta")} />
          ) : view === "team" ? (
            <TeamView {...middle.team} initialCafeId={initialCafeId} onBack={() => setView("talenta")} />
          ) : view === "saved" ? (
            middle.saved?.list?.length ? (
              <TopCandidatesGrid baristas={middle.saved.list} savedIds={middle.saved.savedIds ?? []} ownerId={middle.ownerId} />
            ) : (
              <EmptyState
                icon={<ChevronRight size={20} />}
                title="Belum ada kandidat tersimpan"
                subtitle="Klik ikon hati pada kartu kandidat untuk menyimpannya di sini."
                actionLabel="Lihat talenta"
                actionHref="/find-baristas"
              />
            )
          ) : (
            <TalentaView {...middle.talenta} onNavigate={setView} />
          )}
        </div>
        {middle.talenta.top3?.length > 0 && (
          <div className="shrink-0 lg:pr-1 lg:pb-1">
            <TopCandidatesStrip baristas={middle.talenta.top3} savedIds={middle.talenta.savedIds ?? []} ownerId={middle.ownerId} />
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-4 lg:col-span-2 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 xl:col-span-1 no-scrollbar">
        {right.recs.length === 0 && right.certified.length === 0 ? (
          (middle.talenta.top3?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
            <h3 className="text-sm font-extrabold text-[#2b2118]">Belum ada talenta</h3>
            <p className="mt-0.5 text-[11px] text-[#857768]">Barista baru yang daftar akan muncul di sini.</p>
            <Link href="/find-baristas" className="mt-3 inline-flex min-h-[32px] items-center rounded-full bg-[#3d2c1e] px-4 text-xs font-bold text-white hover:bg-[#2e2015]">
              Cari talenta
            </Link>
          </div>
          ) : null
        ) : (
          <>
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#2b2118]">Recommended Today</h3>
              <p className="mt-0.5 text-[11px] text-[#857768]">Talenta pilihan berdasarkan kebutuhan cafe Anda.</p>
            </div>
            <Link href="/find-baristas" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
              Lihat semua <ChevronRight size={13} />
            </Link>
          </div>
          <div className="mt-2 divide-y divide-[#efe9d9]">
            {right.recs.length ? right.recs.map((b) => (
              <TalentRow key={b.id} barista={b} tag={b.is_open_to_work
                ? { label: "Available Now", cls: "bg-[#e3f0e8] text-[#1f6b4a]" }
                : { label: "Top Match", cls: "bg-[#f5ecd4] text-[#8a6d1f]" }} />
            )) : (
              <p className="py-4 text-center text-xs text-[#857768]">Belum ada talenta lain saat ini.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#2b2118]">Certified Baristas</h3>
              <p className="mt-0.5 text-[11px] text-[#857768]">Barista yang telah menyelesaikan pelatihan di BaristaConnect.</p>
            </div>
            <Link href="/find-baristas" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
              Lihat semua <ChevronRight size={13} />
            </Link>
          </div>
          <div className="mt-2 divide-y divide-[#efe9d9]">
            {right.certified.length ? right.certified.map((b) => (
              <TalentRow key={b.id} barista={b} tag={{ label: "Certified", cls: "bg-[#e3f0e8] text-[#1f6b4a]" }} />
            )) : (
              <p className="py-4 text-center text-xs text-[#857768]">Belum ada barista tersertifikasi.</p>
            )}
          </div>
        </div>
          </>
        )}

        <SmarterOpsCard />
      </div>
    </div>
  );
}
