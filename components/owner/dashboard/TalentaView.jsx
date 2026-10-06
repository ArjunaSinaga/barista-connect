import Link from "next/link";
import HeroTalenta from "@/components/owner/dashboard/HeroTalenta";
import StatCard from "@/components/ui/StatCard";
import { Briefcase, Users, CalendarDays, Star, Newspaper } from "lucide-react";

export default function TalentaView({ heroPhoto, cafeName, cafeLocation, stats, onNavigate = null }) {
  const go = (view) => (onNavigate ? () => onNavigate(view) : undefined);
  const STATS = [
    { icon: Briefcase, label: "Loker Aktif", value: String(stats.activeJobs), sub: `dari ${stats.totalJobs} total`, delta: stats.jobsThisMonth > 0 ? `+${stats.jobsThisMonth} bulan ini` : null, onSelect: go("active") },
    { icon: Users, label: "Pelamar Baru", value: String(stats.pendingApplicants), sub: "menunggu review", delta: null, onSelect: go("pelamar") },
    { icon: CalendarDays, label: "Wawancara Minggu Ini", value: String(stats.interviewsWeek), sub: "7 hari terakhir", delta: null, href: "/messages" },
    { icon: Star, label: "Rating Tim", value: stats.givenAvg ?? "–", sub: stats.givenCount ? `Dari ${stats.givenCount} ulasan` : "Belum ada ulasan", delta: null, onSelect: go("reviews") },
  ];
  return (
    <>
      <HeroTalenta photo={heroPhoto} cafeName={cafeName} cafeLocation={cafeLocation} />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} sub={s.sub} delta={s.delta} chevron onSelect={s.onSelect} href={s.href} />
        ))}
      </div>
      <Link href="/feed" className="mt-3 flex items-center gap-3 rounded-2xl border border-[#e0d5bd] bg-white/70 px-4 py-3 transition hover:border-caramel">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-caramel/15 text-caramel">
          <Newspaper size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-espresso">Feed Barista</span>
          <span className="block truncate text-xs text-espresso-soft">Lihat postingan dan aktivitas para barista</span>
        </span>
        <span className="shrink-0 text-sm font-bold text-caramel">Lihat →</span>
      </Link>
    </>
  );
}
