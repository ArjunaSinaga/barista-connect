import Link from "next/link";
import { ArrowRight, Search, Coffee, Store, Sparkles, MapPin, Clock3 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import JobCard from "@/components/cards/JobCard";
import Button from "@/components/ui/Button";

async function getLatestJobs() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("job_posts")
      .select("*, owners(business_name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const jobs = await getLatestJobs();
  return (
    <div className="min-h-screen bg-[#0f0a08] text-[#fdf6ec]">
      {/* Hero - dark chocolate */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        {/* ambient */}
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_20%_-10%,rgba(212,162,78,0.18),transparent_60%),radial-gradient(700px_400px_at_90%_0%,rgba(181,106,42,0.16),transparent_60%),linear-gradient(to_bottom,transparent,#0f0a08)]" />
        <div className="absolute -top-28 -right-28 h-[560px] w-[560px] rounded-full bg-[#d4a24e]/[0.07] blur-[80px]" />
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#b56a2a]/[0.10] blur-[70px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_70%,transparent_110%)] opacity-30" />

        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-14 sm:pt-20 sm:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d4a24e]/20 card-dark/[0.05] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-[#d4a24e] backdrop-blur">
              <Sparkles size={12} className="text-[#d4a24e]" /> BARISTA CONNECT — DARK ROAST EDITION
            </span>
            <h1 className="mt-6 text-[32px] font-black leading-[0.95] tracking-[-0.03em] sm:text-[56px]">
              <span className="text-[#fdf6ec]">Seduh</span>{" "}
              <span className="text-[#d4a24e]">kariermu.</span>
              <br />
              <span className="text-[#fdf6ec]">Temukan shift-mu.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#fdf6ec]/60 sm:text-[15px]">
              Platform jujur untuk barista dan owner. Lowongan transparan, profil sekali jadi, lamar ke mana saja — tanpa biaya.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="rounded-full bg-gradient-to-r from-[#d4a24e] to-[#b56a2a] px-7 text-[#1a0f09] hover:brightness-110">
                <Link href="/jobs">
                  Jelajah lowongan <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/15 card-dark/[0.06] text-[#fdf6ec] hover:card-dark/[0.10]">
                <Link href="/auth/signup">Daftar gratis</Link>
              </Button>
            </div>
        <form action="/jobs" method="GET" className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-white/10 card-dark/[0.06] p-1.5 backdrop-blur">
          <div className="flex flex-1 items-center gap-2 pl-4">
            <Search size={16} className="shrink-0 text-white/50" />
            <input name="q" placeholder="Cari role, skill, atau lokasi..." className="h-9 w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none" />
          </div>
          <button type="submit" className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#d4a24e] px-6 text-sm font-bold text-[#1c1412] hover:bg-[#c09342]">Cari <ArrowRight size={16} /></button>
        </form>
            <div className="mt-6 flex items-center justify-center gap-5 text-xs text-[#fdf6ec]/45">
              <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-[#d4a24e]" /> Jakarta • Surabaya • Bandung</span>
              <span className="h-3 w-px bg-white/10" />
              <span className="inline-flex items-center gap-1.5"><Clock3 size={13} className="text-[#d4a24e]" /> Update harian</span>
            </div>
          </div>

          {/* glass stats */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-3 gap-3">
            {[
              ["1.200+", "Barista aktif"],
              ["340", "Coffee shop"],
              ["2.1k", "Lamaran / bulan"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-white/[0.08] card-dark/[0.04] p-4 text-center backdrop-blur">
                <div className="text-lg font-black text-[#d4a24e] sm:text-xl">{v}</div>
                <div className="text-[11px] tracking-wide text-[#fdf6ec]/50">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: <Store size={20} className="text-[#d4a24e]" />, title: "Pemilik Coffee Shop", desc: "Pasang lowongan dalam 1 menit, review pelamar terkurasi, tutup shift lebih cepat." },
            { icon: <Coffee size={20} className="text-[#d4a24e]" />, title: "Barista", desc: "Lengkapi profil sekali, lamar ke semua lowongan yang cocok. Gratis selamanya." },
          ].map((s) => (
            <div key={s.title} className="group rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-[#1c1412] to-[#19110f] p-6 transition hover:border-[#d4a24e]/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4a24e]/20 bg-[#d4a24e]/10">{s.icon}</div>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight text-[#fdf6ec]">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-[#fdf6ec]/55">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest jobs */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-black tracking-tight text-[#fdf6ec] sm:text-xl">Lowongan terbaru</h2>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#d4a24e] hover:underline"
              >
                Lihat semua <ArrowRight size={16} />
              </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 card-dark/[0.03] p-10 text-center text-sm text-[#fdf6ec]/50">
            Belum ada lowongan aktif. Jadilah yang pertama pasang — owner verified akan muncul di sini.
          </div>
        ) : (
          <div
                className={`mt-6 grid gap-4 ${
                  jobs.length === 1
                    ? "mx-auto max-w-sm grid-cols-1 place-items-stretch"
                    : jobs.length === 2
                      ? "mx-auto max-w-3xl grid-cols-1 place-items-stretch sm:grid-cols-2"
                      : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
        )}
      </section>
    </div>
  );
}
