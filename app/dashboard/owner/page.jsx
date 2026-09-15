import Link from "next/link"
import { Suspense } from "react"
import { Plus, Briefcase, Users, Eye, Megaphone, TrendingUp, Store, CalendarDays, Star, ChevronRight } from "lucide-react"
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server"
import { EmptyState } from "@/components/ui/EmptyState"
import JobDeleteButton from "@/components/jobs/JobDeleteButton"
import { avgStars } from "@/lib/ratings"
import SidebarOwner from "@/components/owner/dashboard/SidebarOwner"
import HeroTalenta from "@/components/owner/dashboard/HeroTalenta"
import { TopCandidates, TalentRow } from "@/components/owner/dashboard/TopCandidates"
import { SmarterOpsCard } from "@/components/landing/SidebarKerja"

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
  const tab = params?.tab;

  let jobs = []
  let apps = []
  let ownerRow = null
  let cafes = []
  let givenRatings = []
  let convosWeek = []
  let baristas = []
  try {
    const supabase = await createClient()
    const res = await supabase.from("job_posts").select("id,title,location,salary_text,employment_type,employment_types,is_active,created_at,cafes(name)").eq("owner_id", user.id).order("created_at", { ascending: false })
    jobs = res.data ?? []
    const jobIds = jobs.map(j=>j.id)
    if (jobIds.length) {
      const r2 = await supabase.from("applications").select("job_post_id,status").in("job_post_id", jobIds)
      apps = r2.data ?? []
    }
    const [o, c, gr, cw, b] = await Promise.all([
      supabase.from("owners").select("business_name,avatar_url,whatsapp").eq("id", user.id).maybeSingle(),
      supabase.from("cafes").select("id,name,address,location,photo_urls").eq("owner_id", user.id).order("created_at", { ascending: true }),
      supabase.from("ratings").select("stars").eq("owner_id", user.id),
      supabase.from("conversations").select("id").eq("owner_id", user.id).gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString()),
      supabase.from("barista_profiles").select("*, ratings(stars)").eq("is_open_to_work", true).limit(30),
    ]);
    ownerRow = o.data ?? null;
    cafes = c.data ?? [];
    givenRatings = gr.data ?? [];
    convosWeek = cw.data ?? [];
    baristas = b.data ?? [];
  } catch(e) { jobs = []; apps = [] }

  const appCountByJob = {}
  ;(apps||[]).forEach(a => { appCountByJob[a.job_post_id] = (appCountByJob[a.job_post_id]||0)+1 })
  const totalJobs = jobs?.length || 0
  const activeJobs = jobs?.filter(j=>j.is_active).length || 0
  const totalApplicants = Object.values(appCountByJob).reduce((s,n)=>s+n,0)
  const pendingApplicants = (apps||[]).filter(a => a.status === "pending").length
  const avgPerJob = totalJobs ? (totalApplicants/totalJobs).toFixed(1) : "0"

  // ---- Tab Lowongan: tabel lama tetap ada ----
  if (tab === "lowongan") {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-caramel uppercase">Business Manager View</p>
            <h1 className="text-3xl font-black text-espresso leading-none mt-1">Lowongan Saya</h1>
            <p className="text-sm text-espresso-soft mt-2 max-w-xl">Pantau performa rekrutmen seperti laporan cabang. Semua lowongan dan pelamar tercatat rapi, siap dipresentasikan ke manager.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/owner" className="inline-flex items-center gap-2 rounded-full border border-latte bg-white px-5 py-3 text-sm font-bold text-espresso hover:border-caramel">
            <Store size={16}/> Dashboard
          </Link>
          <Link href="/dashboard/owner/cafes" className="inline-flex items-center gap-2 rounded-full border border-latte bg-white px-5 py-3 text-sm font-bold text-espresso hover:border-caramel">
            <Store size={16}/> Cafe Saya
          </Link>
          <Link href="/dashboard/owner/team" className="inline-flex items-center gap-2 rounded-full border border-latte bg-white px-5 py-3 text-sm font-bold text-espresso hover:border-caramel">
            <Users size={16}/> Tim Saya
          </Link>
          <Link href="/dashboard/owner/jobs/new" className="inline-flex items-center gap-2 rounded-full bg-[#3d2c1e] px-5 py-3 text-sm font-bold text-white hover:bg-[#2e2015] transition">
            <Plus size={16}/> Buat Lowongan
          </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl bg-white border border-latte p-4">
            <p className="text-xs font-bold tracking-widest text-espresso-soft uppercase">Total Lowongan</p>
            <p className="text-3xl font-black text-espresso mt-1">{totalJobs}</p>
            <p className="text-xs text-espresso-soft mt-1 flex items-center gap-1"><Briefcase size={12}/>{activeJobs} aktif</p>
          </div>
          <div className="rounded-2xl bg-white border border-latte p-4">
            <p className="text-xs font-bold tracking-widest text-espresso-soft uppercase">Pelamar Masuk</p>
            <p className="text-3xl font-black text-espresso mt-1">{totalApplicants}</p>
            <p className="text-xs text-espresso-soft mt-1 flex items-center gap-1"><Users size={12}/>{avgPerJob} / lowongan</p>
          </div>
          <div className="rounded-2xl bg-white border border-latte p-4">
            <p className="text-xs font-bold tracking-widest text-espresso-soft uppercase">Rasio Aktif</p>
            <p className="text-3xl font-black text-caramel mt-1">{totalJobs ? Math.round(activeJobs/totalJobs*100) : 0}%</p>
            <p className="text-xs text-espresso-soft mt-1 flex items-center gap-1"><TrendingUp size={12}/>kesehatan rekrutmen</p>
          </div>
          <div className="rounded-2xl bg-[#3d2c1e] text-white p-4">
            <p className="text-xs font-bold tracking-widest text-latte uppercase">Butuh Aksi</p>
            <p className="text-3xl font-black mt-1">{jobs?.filter(j=>!j.is_active).length || 0}</p>
            <p className="text-xs text-latte mt-1">lowongan nonaktif</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-latte overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-latte">
            <h2 className="text-sm font-black text-espresso flex items-center gap-2"><Megaphone size={16} className="text-caramel"/> Daftar Lowongan</h2>
            <span className="text-xs bg-cream px-3 py-1 rounded-full text-espresso-soft font-bold">{totalJobs} data</span>
          </div>

          {!jobs || jobs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Megaphone size={22} />}
                title="Belum ada lowongan"
                subtitle="Buat lowongan pertama. Manager akan menilai dari kelengkapan data: lokasi, gaji, dan deskripsi yang jelas."
                actionLabel="Buat Lowongan"
                actionHref="/dashboard/owner/jobs/new"
              />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream text-xs font-bold tracking-widest text-espresso-soft uppercase">
                    <tr>
                      <th className="text-left px-5 py-3">Lowongan</th>
                      <th className="text-left px-3 py-3">Lokasi</th>
                      <th className="text-left px-3 py-3">Gaji</th>
                      <th className="text-left px-3 py-3">Tipe</th>
                      <th className="text-center px-3 py-3">Pelamar</th>
                      <th className="text-center px-3 py-3">Status</th>
                      <th className="text-right px-5 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-latte">
                    {jobs.map(job => (
                      <tr key={job.id} className="hover:bg-cream/50">
                        <td className="px-5 py-3">
                          <p className="font-bold text-espresso leading-tight">{job.title}</p>
                          <p className="text-xs text-espresso-soft">{job.cafes?.name ?? "-"} • {new Date(job.created_at).toLocaleDateString("id-ID")}</p>
                        </td>
                        <td className="px-3 py-3 text-espresso-soft">{job.location || "-"}</td>
                        <td className="px-3 py-3 font-bold text-espresso">{job.salary_text || "-"}</td>
                        <td className="px-3 py-3"><span className="text-xs bg-cream px-2 py-1 rounded-full font-bold text-espresso">{(job.employment_types?.[0] || job.employment_type || "-")}</span></td>
                        <td className="px-3 py-3 text-center font-black text-caramel">{appCountByJob[job.id] || 0}</td>
                        <td className="px-3 py-3 text-center">{job.is_active ? <span className="text-xs bg-caramel text-white px-2 py-1 rounded-full font-bold">Aktif</span> : <span className="text-xs bg-latte text-espresso-soft px-2 py-1 rounded-full font-bold">Nonaktif</span>}</td>
                        <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                          <Link href={`/dashboard/owner/jobs/${job.id}/applicants`} className="text-xs font-bold text-espresso hover:text-caramel inline-flex items-center gap-1"><Eye size={14}/>Kelola</Link>
                          <Link href={`/dashboard/owner/jobs/${job.id}/edit`} className="text-xs font-bold text-espresso hover:text-caramel">Edit</Link>
                          <Link href={`/jobs/${job.id}`} className="text-xs font-bold text-caramel hover:underline">Lihat</Link>
                          <JobDeleteButton jobId={job.id} jobTitle={job.title} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden p-3 space-y-3">
                {jobs.map(job => (
                  <div key={job.id} className="rounded-xl border border-latte p-4">
                    <div className="flex justify-between gap-2">
                      <p className="font-bold text-espresso">{job.title}</p>
                      <span className="text-xs font-bold">{appCountByJob[job.id]||0} pelamar</span>
                    </div>
                    <p className="text-xs text-espresso-soft">{job.cafes?.name ?? "-"} • {job.location} | {(job.employment_types?.[0] || job.employment_type)}</p>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/dashboard/owner/jobs/${job.id}/applicants`} className="flex-1 text-center text-xs font-bold bg-[#3d2c1e] text-white py-2 rounded-full">Kelola</Link>
                      <Link href={`/dashboard/owner/jobs/${job.id}/edit`} className="flex-1 text-center text-xs font-bold border border-latte py-2 rounded-full">Edit</Link>
                      <Link href={`/jobs/${job.id}`} className="flex-1 text-center text-xs font-bold border border-latte py-2 rounded-full">Lihat</Link>
                    </div>
                    <div className="mt-2 text-center">
                      <JobDeleteButton jobId={job.id} jobTitle={job.title} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-latte/60 border border-latte p-4 flex items-start gap-3">
          <div className="rounded-full bg-white p-2"><TrendingUp size={16} className="text-caramel"/></div>
          <div>
            <p className="text-sm font-bold text-espresso">Tips untuk Manager:</p>
            <p className="text-xs text-espresso-soft mt-1 leading-relaxed">Tunjukkan tabel ini saat pitching. Sorot <b>Pelamar / Lowongan</b> dan <b>Rasio Aktif</b> sebagai metrik rekrutmen sehat. Jika pelamar 0, nonaktifkan lowongan duplikat dan perbarui gaji di atas UMR.</p>
          </div>
        </div>

      </div>
    </div>
  )
  }

  // ---- Dashboard talenta ala mockup ----
  const firstCafe = cafes[0] ?? null;
  const heroPhoto = firstCafe?.photo_urls?.[0] ?? null;
  const checks = [
    !!ownerRow?.business_name, !!ownerRow?.avatar_url, !!ownerRow?.whatsapp,
    cafes.length > 0, !!firstCafe?.photo_urls?.length, !!(firstCafe?.address || firstCafe?.whatsapp),
  ];
  const completeness = Math.round(checks.filter(Boolean).length / checks.length * 100);
  const givenCount = givenRatings.length;
  const givenAvg = givenCount ? (givenRatings.reduce((s, r) => s + (r.stars ?? 0), 0) / givenCount).toFixed(1) : null;

  const ranked = rankBaristas(baristas);
  const top3 = ranked.slice(0, 3);
  const recs = ranked.slice(3, 6);
  const certified = ranked.filter(b => (b.certificates?.length ?? 0) > 0).slice(0, 3);

  const STATS = [
    { icon: Briefcase, label: "Active Jobs", value: String(activeJobs), sub: `dari ${totalJobs} total` },
    { icon: Users, label: "New Applicants", value: String(pendingApplicants), sub: "menunggu review" },
    { icon: CalendarDays, label: "Interviews This Week", value: String(convosWeek.length), sub: "7 hari terakhir" },
    { icon: Star, label: "Team Rating", value: givenAvg ?? "–", sub: givenCount ? `Dari ${givenCount} ulasan` : "Belum ada ulasan" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#2b2118]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="grid items-start gap-4 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_330px]">
          <Suspense fallback={null}>
            <SidebarOwner
              cafe={firstCafe}
              ownerName={ownerRow?.business_name}
              completeness={completeness}
              counts={{ activeJobs, applicants: totalApplicants, reviewsGiven: givenCount, cafes: cafes.length }}
            />
          </Suspense>

          <div className="min-w-0 space-y-4">
            <HeroTalenta photo={heroPhoto} cafeName={firstCafe?.name} />
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
                  <p className="flex items-center gap-2 text-xs font-bold text-[#6f6252]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efe9d9] text-[#3d2c1e]"><s.icon size={15} /></span>
                    {s.label}
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-[#2b2118]">{s.value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#1f6b4a]">{s.sub}</p>
                </div>
              ))}
            </div>
            <TopCandidates baristas={top3} />
          </div>

          <div className="min-w-0 space-y-4 lg:col-span-2 xl:col-span-1">
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
                {recs.length ? recs.map((b) => (
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
                {certified.length ? certified.map((b) => (
                  <TalentRow key={b.id} barista={b} tag={{ label: "Certified", cls: "bg-[#e3f0e8] text-[#1f6b4a]" }} />
                )) : (
                  <p className="py-4 text-center text-xs text-[#857768]">Belum ada barista tersertifikasi.</p>
                )}
              </div>
            </div>

            <SmarterOpsCard />
          </div>
        </div>
      </div>
    </div>
  )
}
