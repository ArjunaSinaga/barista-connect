import HeroTalenta from "@/components/owner/dashboard/HeroTalenta";
import StatCard from "@/components/ui/StatCard";
import { Briefcase, Users, CalendarDays, Star } from "lucide-react";

export default function TalentaView({ heroPhoto, cafeName, cafeLocation, stats, onNavigate = null }) {
  const go = (view) => (onNavigate ? () => onNavigate(view) : undefined);
  const STATS = [
    { icon: Briefcase, label: "Active Jobs", value: String(stats.activeJobs), sub: `dari ${stats.totalJobs} total`, delta: stats.jobsThisMonth > 0 ? `+${stats.jobsThisMonth} bulan ini` : null, onSelect: go("active") },
    { icon: Users, label: "New Applicants", value: String(stats.pendingApplicants), sub: "menunggu review", delta: null, onSelect: go("pelamar") },
    { icon: CalendarDays, label: "Interviews This Week", value: String(stats.interviewsWeek), sub: "7 hari terakhir", delta: null, href: "/messages" },
    { icon: Star, label: "Team Rating", value: stats.givenAvg ?? "–", sub: stats.givenCount ? `Dari ${stats.givenCount} ulasan` : "Belum ada ulasan", delta: null, onSelect: go("reviews") },
  ];
  return (
    <>
      <HeroTalenta photo={heroPhoto} cafeName={cafeName} cafeLocation={cafeLocation} />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} sub={s.sub} delta={s.delta} chevron onSelect={s.onSelect} href={s.href} />
        ))}
      </div>
    </>
  );
}
