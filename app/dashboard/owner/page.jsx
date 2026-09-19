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
  let orgs = []
  let orgMembers = []
  let givenRatings = []
  let convosWeek = []
  let baristas = []
  let savedBaristaIds = []
  let teamMembers = []
  let loadError = false
  try {
    const supabase = await createClient()
    // Kafe dalam kuasaku: milik sendiri + scope org (manager). Semua list ikut ini.
    const { data: scopeIds } = await supabase.rpc("my_scope_cafes");
    const scope = (scopeIds ?? []).filter(Boolean);
    const scopeCsv = scope.join(",");
    const res = scope.length
      ? await supabase.from("job_posts").select("id,title,location,salary_text,employment_type,employment_types,is_active,created_at,cafe_id,cafes(name)").or(`owner_id.eq.${user.id},cafe_id.in.(${scopeCsv})`).order("created_at", { ascending: false })
      : await supabase.from("job_posts").select("id,title,location,salary_text,employment_type,employment_types,is_active,created_at,cafe_id,cafes(name)").eq("owner_id", user.id).order("created_at", { ascending: false })
    jobs = res.data ?? []
    const jobIds = jobs.map(j=>j.id)
    if (jobIds.length) {
      const r2 = await supabase.from("applications").select("job_post_id,status").in("job_post_id", jobIds)
      apps = r2.data ?? []
    }
    const [o, c, grRaw, cw, bRaw, sv, tmRaw] = await Promise.all([
      supabase.from("owners").select("business_name,avatar_url,whatsapp,location").eq("id", user.id).maybeSingle(),
      scope.length
        ? supabase.from("cafes").select("id,name,address,location,photo_urls,is_active,invite_code,owner_id,org_id").or(`owner_id.eq.${user.id},id.in.(${scopeCsv})`).order("created_at", { ascending: true })
        : supabase.from("cafes").select("id,name,address,location,photo_urls,is_active,invite_code,owner_id,org_id").eq("owner_id", user.id).order("created_at", { ascending: true }),
      supabase.from("ratings").select("id,stars,comment,created_at,barista_id").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("conversations").select("id").eq("owner_id", user.id).gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString()),
      supabase.from("baristas_public").select("*").eq("is_open_to_work", true).limit(30),
      supabase.from("saved_baristas").select("barista_id").eq("owner_id", user.id),
      scope.length
        ? supabase.from("team_members").select("id, status, job_title, job_post_id, application_id, hired_at, barista_id, cafe_id, cafes(id, name)").or(`owner_id.eq.${user.id},cafe_id.in.(${scopeCsv})`).in("status", ["active", "terminated"]).order("hired_at", { ascending: false })
        : supabase.from("team_members").select("id, status, job_title, job_post_id, application_id, hired_at, barista_id, cafe_id, cafes(id, name)").eq("owner_id", user.id).in("status", ["active", "terminated"]).order("hired_at", { ascending: false }),
    ]);
    const { attachBaristaNames, attachRatings } = await import("@/lib/publicProfiles");
    const grWithNames = await attachBaristaNames(grRaw.data ?? [], supabase);
    givenRatings = grWithNames.map((r) => ({ ...r, barista: r.barista ? { full_name: r.barista.full_name } : null }));
    baristas = await attachRatings(bRaw.data ?? [], supabase);
    const tmIds = [...new Set((tmRaw.data ?? []).map((t) => t.barista_id).filter(Boolean))];
    const { data: tmProfiles } = tmIds.length
      ? await supabase.from("baristas_public").select("id, full_name, profile_picture_url, location_place, years_of_experience, experience_months").in("id", tmIds)
      : { data: [] };
    const tmMap = new Map((tmProfiles ?? []).map((p) => [p.id, { id: p.id, full_name: p.full_name, profile_picture_url: p.profile_picture_url, location_place: p.location_place, years_of_experience: p.years_of_experience, experience_months: p.experience_months }]));
    teamMembers = (tmRaw.data ?? []).map((t) => ({ ...t, barista_profiles: tmMap.get(t.barista_id) ?? null }));
    ownerRow = o.data ?? null;
    cafes = c.data ?? [];
    // Organisasi: milik sendiri + diikuti sebagai manager (baca via policy org_read/members_read)
    try {
      const supabase3 = await createClient();
      const { data: owned } = await supabase3.from("organizations").select("id,name,owner_id,needs_owner,owner_code,manager_code,created_at").eq("owner_id", user.id);
      const { data: mem } = await supabase3.from("org_members").select("org_id,scope_cafe_ids").eq("user_id", user.id);
      const memOrgIds = (mem ?? []).map((m) => m.org_id).filter((id) => !(owned ?? []).some((x) => x.id === id));
      let joined = [];
      if (memOrgIds.length) {
        const { data } = await supabase3.from("organizations").select("id,name,owner_id,needs_owner,owner_code,manager_code,created_at").in("id", memOrgIds);
        joined = data ?? [];
      }
      const allOrgs = [...(owned ?? []), ...joined];
      const withMembers = [];
      for (const org of allOrgs) {
        const { data: members } = await supabase3.rpc("org_member_list", { p_org: org.id });
        withMembers.push({ ...org, isOwner: org.owner_id === user.id, members: members ?? [] });
      }
      orgs = withMembers;
      orgMembers = [];
    } catch { orgs = []; orgMembers = []; }
    convosWeek = cw.data ?? [];
    savedBaristaIds = (sv.data ?? []).map((s) => s.barista_id);
  } catch(e) { jobs = []; apps = []; loadError = true }

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
        {loadError && (
          <p className="mb-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
            Data gagal dimuat — periksa koneksi lalu muat ulang halaman ini.
          </p>
        )}
        <Suspense fallback={null}>
          <DashboardShell
            initialView={params?.tab}
            initialCafeId={typeof params?.cafe === "string" ? params.cafe : null}
            sidebar={{
              cafe: firstCafe,
              ownerName: ownerRow?.business_name,
              completeness,
              completenessItems,
              canSettings: cafes.some((c) => c.owner_id === user.id),
              counts: { activeJobs, applicants: totalApplicants, reviewsGiven: givenCount, cafes: cafes.length, saved: savedList.length, team: teamMembers.length, orgs: orgs.length },
            }}
            middle={{
              ownerId: user.id,
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
              orgs,
              canAddCafe: cafes.some((c) => c.owner_id === user.id) || orgs.some((o) => o.isOwner),
              teamCountByCafe: countTeamByCafe(teamMembers),
              team: { cafes, members: teamMembers, ratingMap: teamRatingMap },
              settings: { initial: ownerRow, publicHref: `/owner/${user.id}` },
              canSettings: cafes.some((c) => c.owner_id === user.id),
            }}
            right={{ recs: ranked.slice(3, 6), certified: ranked.filter(b => (b.certificates?.length ?? 0) > 0).slice(0, 3) }}
          />
        </Suspense>
      </div>
    </div>
  )
}
