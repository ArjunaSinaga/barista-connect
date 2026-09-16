import HeroTalenta from "@/components/owner/dashboard/HeroTalenta";
import { TopCandidatesGrid } from "@/components/owner/dashboard/TopCandidates";
import StatCard from "@/components/ui/StatCard";
import { Briefcase, Users, CalendarDays, Star } from "lucide-react";

export default function TalentaView({ heroPhoto, cafeName, cafeLocation, stats, top3, savedIds = [] }) {
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
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} sub={s.sub} delta={s.delta} chevron />
        ))}
      </div>
      {/* Top Candidates sekarang di bagian bawah DashboardShell */}
    </>
  );
}
