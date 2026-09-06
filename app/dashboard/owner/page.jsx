import Link from "next/link"
import { Plus, Briefcase, Users, Eye, Megaphone, TrendingUp } from "lucide-react"
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Dashboard Owner - Barista Connect" }

export default async function OwnerDashboardPage() {
  if (!isSupabaseConfigured()) {
    return <div class="p-8 text-center text-sm text-espresso-soft">Supabase belum dikonfigurasi.</div>
  }
  const { user, profile } = await getSessionSafe()
  if (!user) return <div class="p-8">Silakan login.</div>
  const supabase = await createClient()
  const { data: jobs } = await supabase.from("job_posts").select("id,title,location,salary_min,salary_max,job_type,is_active,created_at").eq("owner_id", profile.id).order("created_at", { ascending: false })
  const { data: apps } = await supabase.from("applications").select("job_post_id").in("job_post_id", (jobs||[]).map(j=>j.id))
  const appCountByJob = {}
  ;(apps||[]).forEach(a => { appCountByJob[a.job_post_id] = (appCountByJob[a.job_post_id]||0)+1 })
  const totalJobs = jobs?.length || 0
  const activeJobs = jobs?.filter(j=>j.is_active).length || 0
  const totalApplicants = Object.values(appCountByJob).reduce((s,n)=>s+n,0)
  const avgPerJob = totalJobs ? (totalApplicants/totalJobs).toFixed(1) : "0"
  return (
    <div class="min-h-screen bg-cream">
      <div class="mx-auto max-w-6xl px-5 py-8">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p class="text-xs font-bold tracking-widest text-caramel uppercase">Business Manager View</p>
            <h1 class="text-3xl font-black text-espresso leading-none mt-1">Lowongan Saya</h1>
            <p class="text-sm text-espresso-soft mt-2 max-w-xl">Pantau performa rekrutmen seperti laporan cabang. Semua lowongan dan pelamar tercatat rapi, siap dipresentasikan ke manager.</p>
          </div>
          <Link href="/dashboard/owner/jobs/new" class="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-3 text-sm font-bold text-white hover:bg-black transition">
            <Plus size={16}/> Buat Lowongan
          </Link>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div class="rounded-2xl bg-white border border-latte p-4">
            <p class="text-xs font-bold tracking-widest text-espresso-soft uppercase">Total Lowongan</p>
            <p class="text-3xl font-black text-espresso mt-1">{totalJobs}</p>
            <p class="text-xs text-espresso-soft mt-1 flex items-center gap-1"><Briefcase size={12}/>{activeJobs} aktif</p>
          </div>
          <div class="rounded-2xl bg-white border border-latte p-4">
            <p class="text-xs font-bold tracking-widest text-espresso-soft uppercase">Pelamar Masuk</p>
            <p class="text-3xl font-black text-espresso mt-1">{totalApplicants}</p>
            <p class="text-xs text-espresso-soft mt-1 flex items-center gap-1"><Users size={12}/>{avgPerJob} / lowongan</p>
          </div>
          <div class="rounded-2xl bg-white border border-latte p-4">
            <p class="text-xs font-bold tracking-widest text-espresso-soft uppercase">Rasio Aktif</p>
            <p class="text-3xl font-black text-caramel mt-1">{totalJobs ? Math.round(activeJobs/totalJobs*100) : 0}%</p>
            <p class="text-xs text-espresso-soft mt-1 flex items-center gap-1"><TrendingUp size={12}/>kesehatan rekrutmen</p>
          </div>
          <div class="rounded-2xl bg-espresso text-white p-4">
            <p class="text-xs font-bold tracking-widest text-latte uppercase">Butuh Aksi</p>
            <p class="text-3xl font-black mt-1">{jobs?.filter(j=>!j.is_active).length || 0}</p>
            <p class="text-xs text-latte mt-1">lowongan nonaktif</p>
          </div>
        </div>
        <div class="rounded-2xl bg-white border border-latte overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-latte">
            <h2 class="text-sm font-black text-espresso flex items-center gap-2"><Megaphone size={16} class="text-caramel"/> Daftar Lowongan</h2>
            <span class="text-xs bg-cream px-3 py-1 rounded-full text-espresso-soft font-bold">{totalJobs} data</span>
          </div>

          {!jobs || jobs.length === 0 ? (
            <div class="p-8">
              <EmptyState
                icon={Megaphone}
                title="Belum ada lowongan"
                description="Buat lowongan pertama. Manager akan menilai dari kelengkapan data: lokasi, gaji, dan deskripsi yang jelas."
                actionLabel="Buat Lowongan"
                actionHref="/dashboard/owner/jobs/new"
              />
            </div>
          ) : (
            <>
              <div class="hidden md:block overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-cream text-xs font-bold tracking-widest text-espresso-soft uppercase">
                    <tr>
                      <th class="text-left px-5 py-3">Lowongan</th>
                      <th class="text-left px-3 py-3">Lokasi</th>
                      <th class="text-left px-3 py-3">Gaji</th>
                      <th class="text-left px-3 py-3">Tipe</th>
                      <th class="text-center px-3 py-3">Pelamar</th>
                      <th class="text-center px-3 py-3">Status</th>
                      <th class="text-right px-5 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-latte">
                    {jobs.map(job => (
                      <tr key={job.id} class="hover:bg-cream/50">
                        <td class="px-5 py-3">
                          <p class="font-bold text-espresso leading-tight">{job.title}</p>
                          <p class="text-xs text-espresso-soft">{new Date(job.created_at).toLocaleDateString("id-ID")}</p>
                        </td>
                        <td class="px-3 py-3 text-espresso-soft">{job.location || "-"}</td>
                        <td class="px-3 py-3 font-bold text-espresso">{job.salary_min ? `Rp ${(job.salary_min/1000).toFixed(0)}k` : "-"} {job.salary_max ? `- ${(job.salary_max/1000).toFixed(0)}k` : ""}</td>
                        <td class="px-3 py-3"><span class="text-xs bg-cream px-2 py-1 rounded-full font-bold text-espresso">{job.job_type}</span></td>
                        <td class="px-3 py-3 text-center font-black text-caramel">{appCountByJob[job.id] || 0}</td>
                        <td class="px-3 py-3 text-center">{job.is_active ? <span class="text-xs bg-caramel text-white px-2 py-1 rounded-full font-bold">Aktif</span> : <span class="text-xs bg-latte text-espresso-soft px-2 py-1 rounded-full font-bold">Nonaktif</span>}</td>
                        <td class="px-5 py-3 text-right flex items-center justify-end gap-2">
                          <Link href={`/dashboard/owner/jobs/${job.id}`} class="text-xs font-bold text-espresso hover:text-caramel inline-flex items-center gap-1"><Eye size={14}/>Kelola</Link>
                          <Link href={`/jobs/${job.id}`} class="text-xs font-bold text-caramel hover:underline">Lihat</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div class="md:hidden p-3 space-y-3">
                {jobs.map(job => (
                  <div key={job.id} class="rounded-xl border border-latte p-4">
                    <div class="flex justify-between gap-2">
                      <p class="font-bold text-espresso">{job.title}</p>
                      <span class="text-xs font-bold">{appCountByJob[job.id]||0} pelamar</span>
                    </div>
                    <p class="text-xs text-espresso-soft">{job.location} | {job.job_type}</p>
                    <div class="flex gap-2 mt-3">
                      <Link href={`/dashboard/owner/jobs/${job.id}`} class="flex-1 text-center text-xs font-bold bg-espresso text-white py-2 rounded-full">Kelola</Link>
                      <Link href={`/jobs/${job.id}`} class="flex-1 text-center text-xs font-bold border border-latte py-2 rounded-full">Lihat</Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div class="mt-4 rounded-xl bg-latte/60 border border-latte p-4 flex items-start gap-3">
          <div class="rounded-full bg-white p-2"><TrendingUp size={16} class="text-caramel"/></div>
          <div>
            <p class="text-sm font-bold text-espresso">Tips untuk Manager:</p>
            <p class="text-xs text-espresso-soft mt-1 leading-relaxed">Tunjukkan tabel ini saat pitching. Sorot <b>Pelamar / Lowongan</b> dan <b>Rasio Aktif</b> sebagai metrik rekrutmen sehat. Jika pelamar 0, nonaktifkan lowongan duplikat dan perbarui gaji di atas UMR.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
