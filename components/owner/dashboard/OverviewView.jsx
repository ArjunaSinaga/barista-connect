import Image from "next/image";
import Link from "next/link";
import {
  Briefcase, Users, Hourglass, CheckCircle2, Plus, LayoutList,
  Search, Store, UserPlus, ChevronRight, Info,
} from "lucide-react";
import { Suspense } from "react";
import OverviewFilters from "@/components/owner/dashboard/OverviewFilters";
import JobRowMenu from "@/components/owner/dashboard/JobRowMenu";
import Avatar from "@/components/ui/Avatar";
import { relativeTime } from "@/lib/time";
import { STATUS_META } from "@/lib/constants";

// EMPDASH overview: hero + 4 stat + pipeline + aktivitas + aksi cepat + tabel + butuh tindakan.
// Semua angka dari props server (data real). Tahap interview tidak ada di DB:
// kartu ke-3 = Lamaran Diproses (pending) dan pipeline tanpa baris interview.
export default function OverviewView({ overview }) {
  const o = overview;
  const maxPipe = Math.max(1, ...o.pipeline.map((p) => p.count));
  const rangeLabel = o.rangeParam === "all" ? "Semua waktu" : `${o.rangeParam} hari terakhir`;

  const stats = [
    { icon: Briefcase, label: "Lowongan Aktif", value: o.stats.activeJobs, sub: "saat ini", href: "?tab=active", link: "Lihat Lowongan" },
    { icon: Users, label: "Total Pelamar", value: o.stats.totalApps, sub: rangeLabel, delta: o.stats.deltaApps, href: "?tab=pelamar", link: "Lihat Pelamar" },
    { icon: Hourglass, label: "Lamaran Diproses", value: o.stats.pending, sub: "menunggu keputusan", href: "?tab=pelamar", link: "Lihat Pipeline" },
    { icon: CheckCircle2, label: "Kandidat Diterima", value: o.stats.accepted, sub: rangeLabel, delta: o.stats.deltaAccepted, href: "?tab=pelamar", link: "Lihat Riwayat" },
  ];

  const quick = [
    { icon: Plus, title: "Buat Lowongan", sub: "Temukan talenta baru", href: "/dashboard/owner/jobs/new", dark: true },
    { icon: LayoutList, title: "Kelola Lowongan", sub: "Edit & pantau performa", href: "?tab=active" },
    { icon: Users, title: "Lihat Pelamar", sub: "Kelola semua pelamar", href: "?tab=pelamar" },
    { icon: Search, title: "Cari Talenta", sub: "Cari kandidat proaktif", href: "/find-baristas" },
    { icon: Store, title: "Kelola Outlet", sub: "Atur cabang / lokasi", href: "?tab=cafes" },
    { icon: UserPlus, title: "Undang Tim", sub: "Tambah recruiter", href: "?tab=org" },
  ];

  if (!o.hasJobs) {
    return (
      <div className="rounded-2xl border border-[#e8e0cf] bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coffee/10 text-coffee">
          <Briefcase size={24} />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-espresso">Selamat datang di dashboard, {o.businessName}!</h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-espresso-soft">
          Buat lowongan pertamamu untuk mulai menerima lamaran, memantau pipeline, dan membangun tim.
        </p>
        <Link href="/dashboard/owner/jobs/new" className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-coffee px-6 text-sm font-bold text-white hover:bg-[#2e2015]">
          <Plus size={16} /> Buat Lowongan Pertama
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      {/* Hero */}
      <section className="relative grid overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#faf6ec] md:grid-cols-[1fr_240px]">
        <div className="p-5 sm:p-6">
          <p className="text-sm text-espresso-soft">Selamat datang kembali,</p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-espresso sm:text-3xl">{o.businessName}</h1>
          <p className="mt-1 max-w-md text-xs leading-5 text-espresso-soft">
            Terus temukan talenta terbaik untuk tim Anda. Kelola lowongan, pantau progres pelamar, dan kembangkan bisnis Anda bersama kerja.inc.
          </p>
          <div className="mt-3">
            <Suspense>
              <OverviewFilters cafes={o.cafes} outlet={o.outletParam} range={o.rangeParam} />
            </Suspense>
          </div>
        </div>
        {o.heroPhoto && (
          <div className="relative hidden min-h-48 md:block">
            <Image src={o.heroPhoto} alt={o.businessName} fill className="object-cover" sizes="240px" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf6ec] via-transparent to-transparent" />
          </div>
        )}
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Ringkasan metrik">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#e8e0cf] bg-white p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-espresso-soft">
              <s.icon size={14} className="text-caramel" />{s.label}
            </p>
            <p className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-espresso tabular-nums">{s.value}</span>
              {s.delta && <span className="text-[11px] font-bold text-green-600">{s.delta}</span>}
            </p>
            <p className="text-[11px] text-[#b6a98f]">{s.sub}</p>
            <Link href={s.href} className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-bold text-link hover:underline">
              {s.link} <ChevronRight size={12} />
            </Link>
          </div>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Pipeline */}
        <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
          <h2 className="text-sm font-extrabold text-espresso">Pipeline Rekrutmen</h2>
          <ul className="mt-3 space-y-2.5">
            {o.pipeline.map((p) => (
              <li key={p.label} className="flex items-center gap-2.5 text-xs">
                <span className="w-28 shrink-0 font-bold text-espresso-soft">{p.label}</span>
                <span className="w-10 shrink-0 text-right font-extrabold text-espresso tabular-nums">{p.count}</span>
                <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#efe9d9]">
                  <span className="block h-full rounded-full bg-coffee" style={{ width: `${Math.round((p.count / maxPipe) * 100)}%` }} />
                </span>
                <span className="w-9 shrink-0 text-right text-[#b6a98f] tabular-nums">{Math.round((p.count / maxPipe) * 100)}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 flex items-start gap-1 text-[11px] leading-4 text-[#b6a98f]">
            <Info size={12} className="mt-0.5 shrink-0" /> Tahap interview belum dilacak terpisah — kelola undangan via pesan.
          </p>
        </section>

        {/* Aktivitas */}
        <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-espresso">Aktivitas Terbaru</h2>
            <Link href="?tab=pelamar" className="inline-flex items-center gap-0.5 text-[11px] font-bold text-link hover:underline">
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>
          {o.recent.length ? (
            <ul className="mt-3 space-y-2.5">
              {o.recent.map((r) => {
                const meta = STATUS_META[r.status];
                return (
                  <li key={r.id} className="flex items-center gap-2.5 text-xs">
                    <Avatar name={r.name} size="md" className="shrink-0" />
                    <p className="min-w-0 flex-1 leading-4">
                      <span className="font-extrabold text-espresso">{r.name}</span>
                      <span className="text-espresso-soft"> melamar {r.jobTitle}</span>
                      {meta && <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${meta.classes}`}>{meta.label}</span>}
                    </p>
                    <span className="shrink-0 text-[10px] text-[#b6a98f]">{relativeTime(r.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-espresso-soft">Belum ada aktivitas pada periode ini.</p>
          )}
        </section>
      </div>

      {/* Aksi cepat */}
      <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
        <h2 className="text-sm font-extrabold text-espresso">Aksi Cepat <span className="ml-1 font-medium text-espresso-soft">Lakukan aktivitas rekrutmen dengan cepat.</span></h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
          {quick.map((q) => (
            <Link
              key={q.title}
              href={q.href}
              className={`rounded-xl p-3.5 ${q.dark ? "bg-coffee text-white hover:bg-[#2e2015]" : "border border-[#e8e0cf] hover:border-coffee"}`}
            >
              <q.icon size={18} className={q.dark ? "" : "text-caramel"} />
              <p className={`mt-2 text-xs font-extrabold ${q.dark ? "" : "text-espresso"}`}>{q.title}</p>
              <p className={`mt-0.5 text-[10px] leading-3 ${q.dark ? "text-white/70" : "text-espresso-soft"}`}>{q.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Tabel loker */}
        <section className="min-w-0 rounded-2xl border border-[#e8e0cf] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-espresso">Lowongan Aktif</h2>
            <Link href="?tab=active" className="inline-flex items-center gap-0.5 text-[11px] font-bold text-link hover:underline">
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {o.topJobs.map((j) => (
              <li key={j.id} className="flex items-center gap-2.5 rounded-xl border border-[#efe9d9] p-2.5">
                <div className="min-w-0 flex-1">
                  <Link href={`/jobs/${j.id}`} className="block truncate text-[13px] font-extrabold text-espresso hover:text-caramel">{j.title}</Link>
                  <p className="truncate text-[11px] text-espresso-soft">{j.outlet}</p>
                </div>
                <Link href="?tab=pelamar" className="shrink-0 text-center" title="Lihat pelamar">
                  <span className="block text-sm font-extrabold text-espresso tabular-nums">{j.count}</span>
                  <span className="block text-[10px] text-espresso-soft">pelamar</span>
                </Link>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${j.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {j.is_active ? "Aktif" : "Nonaktif"}
                </span>
                <JobRowMenu job={j} />
              </li>
            ))}
            {!o.topJobs.length && <p className="text-xs text-espresso-soft">Belum ada lowongan pada filter ini.</p>}
          </ul>
        </section>

        {/* Butuh tindakan */}
        <section className="min-w-0 rounded-2xl border border-[#e8e0cf] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-espresso">
              Kandidat Perlu Tindakan
              {o.pendingAction.length > 0 && (
                <span className="ml-1.5 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white tabular-nums">{o.pendingAction.length}</span>
              )}
            </h2>
            <Link href="?tab=pelamar" className="inline-flex items-center gap-0.5 text-[11px] font-bold text-link hover:underline">
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>
          <p className="mt-1.5 rounded-xl bg-[#fff8e8] px-3.5 py-2.5 text-[11px] leading-4 text-espresso-soft">
            Setelah interview, mohon update status kandidat ke Diterima atau Ditolak melalui halaman detail lamaran.
          </p>
          {o.pendingAction.length ? (
            <ul className="mt-2.5 space-y-2">
              {o.pendingAction.map((c) => (
                <li key={c.id}>
                  <Link href="?tab=pelamar" className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-[#faf7ef]">
                    <Avatar name={c.name} size="md" className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-extrabold text-espresso">{c.name}</span>
                      <span className="block truncate text-[11px] text-espresso-soft">{c.jobTitle}</span>
                    </span>
                    <span className="shrink-0 text-[10px] text-[#b6a98f]">{relativeTime(c.created_at)}</span>
                    <ChevronRight size={15} className="shrink-0 text-espresso-soft" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2.5 text-xs text-espresso-soft">Tidak ada kandidat menunggu keputusan. 🎉</p>
          )}
        </section>
      </div>
    </div>
  );
}
