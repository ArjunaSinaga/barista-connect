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
import { TalentRow } from "@/components/owner/dashboard/TopCandidates";
import { SmarterOpsCard } from "@/components/landing/SidebarKerja";

// Shell 3 kolom: sidebar tetap, hanya kolom TENGAH yang ganti
// (talenta/active/pelamar/reviews/cafes) tanpa navigasi halaman.
const VIEWS = ["talenta", "active", "pelamar", "reviews", "cafes", "settings"];
const LEGACY = { lowongan: "active" }; // deep-link lama tetap jalan
export default function DashboardShell({ initialView = "talenta", sidebar, middle, right }) {
  const start = LEGACY[initialView] ?? initialView;
  const [view, setView] = useState(VIEWS.includes(start) ? start : "talenta");
  return (
    <div className="grid items-start gap-4 lg:h-full lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_320px]">
      <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 no-scrollbar">
        <SidebarOwner {...sidebar} view={view} onNavigate={setView} />
      </div>

      <div className="min-w-0 space-y-3 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1 no-scrollbar">
        {view === "active" ? (
          <ActiveJobsView {...middle.active} onBack={() => setView("talenta")} />
        ) : view === "pelamar" ? (
          <PelamarView {...middle.pelamar} onBack={() => setView("talenta")} />
        ) : view === "reviews" ? (
          <ReviewsView {...middle.reviews} onBack={() => setView("talenta")} />
        ) : view === "cafes" ? (
          <CafesView {...middle.cafes} onBack={() => setView("talenta")} />
        ) : view === "settings" ? (
          <SettingsView {...middle.settings} onBack={() => setView("talenta")} />
        ) : (
          <TalentaView {...middle.talenta} />
        )}
      </div>

      <div className="min-w-0 space-y-4 lg:col-span-2 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 xl:col-span-1 no-scrollbar">
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
              <p className="mt-0.5 text-[11px] text-[#857768]">Barista yang telah menyelesaikan pelatihan di kerja.inc.</p>
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

        <SmarterOpsCard />
      </div>
    </div>
  );
}
