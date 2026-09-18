"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import SidebarBarista from "@/components/barista/SidebarBarista";
import { EmptyState } from "@/components/ui/EmptyState";

// Shell dashboard barista — kerangka sama dengan DashboardShell owner:
// sidebar tetap, hanya kolom TENGAH yang ganti tanpa navigasi halaman.
const VIEWS = ["ringkasan", "lamaran", "tersimpan", "pengaturan"];
export default function BaristaShell({ initialView = "ringkasan", sidebar, middle, right }) {
  const [view, setView] = useState(VIEWS.includes(initialView) ? initialView : "ringkasan");
  return (
    <div className="grid items-start gap-4 lg:h-full lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_320px]">
      <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 no-scrollbar">
        <SidebarBarista {...sidebar} view={view} onNavigate={setView} />
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <div className="min-w-0 space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 lg:pb-1 no-scrollbar">
          {view === "lamaran" ? (
            middle.lamaran
          ) : view === "tersimpan" ? (
            middle.tersimpan
          ) : view === "pengaturan" ? (
            middle.pengaturan
          ) : (
            middle.ringkasan
          )}
        </div>
        {(middle.waiting ?? 0) > 0 && (
          <div className="shrink-0 rounded-2xl bg-[#2b1c11] px-5 py-3 text-sm font-bold text-[#f5f1e8] lg:mr-1">
            📨 {middle.waiting} lamaran menunggu kabar — cek Pesan biar tak ketinggalan.
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-4 lg:col-span-2 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pb-1 xl:col-span-1 no-scrollbar">
        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#2b2118]">Loker Untukmu</h3>
              <p className="mt-0.5 text-[11px] text-[#857768]">Lowongan aktif terbaru.</p>
            </div>
            <Link href="/jobs" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
              Lihat semua <ChevronRight size={13} />
            </Link>
          </div>
          <div className="mt-2 divide-y divide-[#efe9d9]">
            {(right.latestJobs ?? []).length ? (
              right.latestJobs.map((j) => (
                <Link key={j.id} href={`/jobs/${j.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#faf7ef]">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-extrabold text-[#2b2118]">{j.title}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] text-[#857768]">
                      <MapPin size={10} /> {j.location ?? "-"}
                    </span>
                  </span>
                  <ChevronRight size={15} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
                </Link>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-[#857768]">Belum ada loker aktif.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
          <h3 className="text-sm font-extrabold text-[#2b2118]">Reputasiku</h3>
          <p className="mt-1 text-xs leading-5 text-[#857768]">
            {right.ratingCount > 0
              ? `⭐ ${right.ratingAvg} dari ${right.ratingCount} ulasan kafe. Pertahankan!`
              : "Belum ada ulasan — selesaikan pekerjaan pertamamu."}
          </p>
          <Link href="/reviews" className="mt-2 inline-block text-xs font-bold text-[#2b6cb0] hover:underline">
            Lihat ulasan →
          </Link>
        </div>
      </div>
    </div>
  );
}
