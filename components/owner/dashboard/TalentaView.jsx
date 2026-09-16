import HeroTalenta from "@/components/owner/dashboard/HeroTalenta";
import { TopCandidates } from "@/components/owner/dashboard/TopCandidates";
import { Briefcase, Users, CalendarDays, Star, ChevronRight } from "lucide-react";

// Kolom tengah mode talenta: hero + stat + kandidat.
export default function TalentaView({ heroPhoto, cafeName, cafeLocation, stats, top3 }) {
  const STATS = [
    { icon: Briefcase, label: "Active Jobs", value: String(stats.activeJobs), sub: `dari ${stats.totalJobs} total`, delta: stats.jobsThisMonth > 0 ? `+${stats.jobsThisMonth} bulan ini` : null },
    { icon: Users, label: "New Applicants", value: String(stats.pendingApplicants), sub: "menunggu review", delta: null },
    { icon: CalendarDays, label: "Interviews This Week", value: String(stats.interviewsWeek), sub: "7 hari terakhir", delta: null },
    { icon: Star, label: "Team Rating", value: stats.givenAvg ?? "–", sub: stats.givenCount ? `Dari ${stats.givenCount} ulasan` : "Belum ada ulasan", delta: null },
  ];
  return (
    <>
      <HeroTalenta photo={heroPhoto} cafeName={cafeName} cafeLocation={cafeLocation} />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-3 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
            <p className="flex items-center gap-2 text-xs font-bold text-[#6f6252]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#efe9d9] text-[#3d2c1e]"><s.icon size={14} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              <ChevronRight size={13} aria-hidden="true" className="shrink-0 text-[#b6a98f]" />
            </p>
            <p className="mt-1.5 text-2xl font-black tracking-tight text-[#2b2118] tabular-nums">{s.value}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-[#1f6b4a]">
              {s.delta ? <span className="mr-1">↑ {s.delta} ·</span> : null}{s.sub}
            </p>
          </div>
        ))}
      </div>
      <TopCandidates baristas={top3} />
    </>
  );
}
