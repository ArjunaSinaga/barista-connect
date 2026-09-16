import { Suspense } from "react"
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server"
import { avgStars } from "@/lib/ratings"
import { getBusinessCompleteness } from "@/lib/profile-completeness"
import { countTeamByCafe } from "@/lib/team";
import DashboardShell from "@/components/owner/dashboard/DashboardShell"

export const metadata = { title: "Dashboard Owner - Barista Connect" }

function rankBaristas(list) {
  return [...(list ?? [])].sort((a, b) => {
    const aa = parseFloat(avgStars(a.ratings) ?? "-1");
    const bb = parseFloat(avgStars(b.ratings) ?? "-1");
    if (bb !== aa) return bb - aa;
    return (b.ratings?.length ?? 0) - (a.ratings?.length ?? 0);
  });
}

export default async function OwnerDashboardPage({ searchParams }) {
  if (!isSupabaseConfigured()) {
    return <div className="p-8 text-center text-sm text-espresso-soft">Supabase belum dikonfigurasi.</div>
  }
  const { user, profile } = await getSessionSafe()
  if (!user) return <div className="p-8 text-center">Silakan login di <a href="/login" className="text-caramel underline">/login</a>.</div>
  if (!profile) return <div className="p-8 text-center">Akun belum lengkap, <a href="/onboarding/owner" className="text-caramel underline">lengkapi profil owner</a>.</div>
  const params = await searchParams;

  let jobs = []
  let apps = []
  let ownerRow = null
  let cafes = []
  let givenRatings = []
  let convosWeek = []
  let baristas = []
  let savedBaristaIds = []
  let teamMembers = []
  try {
    const supabase = await createClient()
    const res = await supabase.from("job_posts").select("id,title,location,salary_text,employment_type,employment_types,is_active,created_at,cafe_id,cafes(name)").eq("owner_id", user.id).order("created_at", { ascending: false })
    jobs = res.data ?? []
    const jobIds = jobs.map(j=>j.id)
    if (jobIds.length) {
      const r2 = await supabase.from("applications").select("job_post_id,status").in("job_post_id", jobIds)
      apps = r2.data ?? []
    }
    const [o, c, gr, cw, b, sv, tm] = await Promise.all([
      supabase.from("owners").select("business_name,avatar_url,whatsapp,location").eq("id", user.id).maybeSingle(),
      supabase.from("cafes").select("id,name,address,location,photo_urls,is_active").eq("owner_id", user.id).order("created_at", { ascending: true }),
      supabase.from("ratings").select("stars,comment,created_at, barista:barista_profiles!ratings_barista_id_fkey(full_name,profile_picture_url)").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("conversations").select("id").eq("owner_id", user.id).gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString()),
      supabase.from("barista_profiles").select("*, ratings(stars)").eq("is_open_to_work", true).limit(30),
      supabase.from("saved_baristas").select("barista_id").eq("owner_id", user.id),
      supabase.from("team_members").select("id, status, job_title, job_post_id, application_id, hired_at, barista_id, cafe_id, cafes(id, name), barista_profiles(id, full_name, profile_picture_url, location_place, years_of_experience)").eq("owner_id", user.id).in("status", ["active", "terminated"]).order("hired_at", { ascending: false }),
    ]);
    ownerRow = o.data ?? null;
    cafes = c.data ?? [];
    givenRatings = gr.data ?? [];
    convosWeek = cw.data ?? [];
    baristas = b.data ?? [];
    savedBaristaIds = (sv.data ?? []).map((s) => s.barista_id);
    teamMembers = tm.data ?? [];
  } catch(e) { jobs = []; apps = [] }

  const appCountByJob = {}
  ;(apps||[]).forEach(a => { appCountByJob[a.job_post_id] = (appCountByJob[a.job_post_id]||0)+1 })
  const totalJobs = jobs?.length || 0
  const activeJobs = jobs?.filter(j=>j.is_active).length || 0
  const totalApplicants = Object.values(appCountByJob).reduce((s,n)=>s+n,0)
  const pendingApplicants = (apps||[]).filter(a => a.status === "pending").length
  const avgPerJob = totalJobs ? (totalApplicants/totalJobs).toFixed(1) : "0"

  const firstCafe = cafes[0] ?? null;
  const { completeness, missing, items: completenessItems } = getBusinessCompleteness(ownerRow, cafes);
  const givenCount = givenRatings.length;
  const givenAvg = givenCount ? (givenRatings.reduce((s, r) => s + (r.stars ?? 0), 0) / givenCount).toFixed(1) : null;
  const teamIds = teamMembers.map((m) => m.id);
  let teamRatingMap = {};
  if (teamIds.length) {
    try {
      const supabase2 = await createClient();
      const { data: tr } = await supabase2.from("ratings").select("team_member_id, stars, comment").in("team_member_id", teamIds);
      (tr ?? []).forEach((r) => { teamRatingMap[r.team_member_id] = r; });
    } catch { teamRatingMap = {}; }
  }
  const monthAgo = Date.now() - 30 * 864e5;
  const jobsThisMonth = (jobs ?? []).filter((j) => j.created_at && new Date(j.created_at).getTime() >= monthAgo).length;

  const ranked = rankBaristas(baristas);
  const savedSet = new Set(savedBaristaIds);
  const savedList = ranked.filter((x) => savedSet.has(x.id));
  const countByCafe = {};
  (jobs ?? []).forEach((j) => { if (j.is_active && j.cafe_id) countByCafe[j.cafe_id] = (countByCafe[j.cafe_id] ?? 0) + 1; });
  const statusByJob = {};
  const totals = { total: 0, pending: 0, accepted: 0, rejected: 0 };
  (apps ?? []).forEach((a) => {
    totals.total += 1;
    if (a.status === "pending") totals.pending += 1;
    else if (a.status === "accepted") totals.accepted += 1;
    else if (a.status === "rejected") totals.rejected += 1;
    const sb = (statusByJob[a.job_post_id] ??= { pending: 0 });
    if (a.status === "pending") sb.pending += 1;
  });

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#2b2118] lg:flex lg:h-[calc(100dvh-3.5rem)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:min-h-0 lg:flex-1">
        <Suspense fallback={null}>
          <DashboardShell
            initialView={params?.tab}
            sidebar={{
              cafe: firstCafe,
              ownerName: ownerRow?.business_name,
              completeness,
              completenessItems,
              counts: { activeJobs, applicants: totalApplicants, reviewsGiven: givenCount, cafes: cafes.length, saved: savedList.length, team: teamMembers.length },
            }}
            middle={{
              talenta: {
                heroPhoto: firstCafe?.photo_urls?.[0] ?? null,
                cafeName: firstCafe?.name,
                cafeLocation: firstCafe?.address ?? firstCafe?.location ?? ownerRow?.location ?? null,
                stats: { activeJobs, totalJobs, jobsThisMonth, pendingApplicants, interviewsWeek: convosWeek.length, givenAvg, givenCount },
                top3: ranked.slice(0, 3),
                savedIds: savedBaristaIds,
              },
              saved: { list: savedList, savedIds: savedBaristaIds },
              active: { jobs, appCountByJob, totalJobs, activeJobs },
              pelamar: { jobs, appCountByJob, statusByJob, totals },
              reviews: { reviews: givenRatings },
              cafes: { cafes, countByCafe },
              teamCountByCafe: countTeamByCafe(teamMembers),
              team: { cafes, members: teamMembers, ratingMap: teamRatingMap },
              settings: { initial: ownerRow, publicHref: `/owner/${user.id}` },
            }}
            right={{ recs: ranked.slice(3, 6), certified: ranked.filter(b => (b.certificates?.length ?? 0) > 0).slice(0, 3) }}
          />
        </Suspense>
      </div>
    </div>
  )
}
