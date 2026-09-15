import Link from "next/link";
import { ArrowRight, Search, Coffee, Store, Sparkles, MapPin, Clock3 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import JobCard from "@/components/cards/JobCard";
import HeroPhoto from "@/components/landing/HeroPhoto";
import Button from "@/components/ui/Button";

async function getLatestJobs() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("job_posts")
      .select("*, owners(business_name), cafes(name, photo_urls)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

async function getTopCities() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cafes")
      .select("location")
      .eq("is_active", true)
      .limit(200);
    const count = {};
    (data ?? []).forEach((c) => {
      const city = (c.location || "").trim();
      if (city) count[city] = (count[city] || 0) + 1;
    });
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city]) => city);
  } catch {
    return [];
  }
}

async function getLiveStats() {
  const fallback = [
    ["0", "Barista terdaftar"],
    ["0", "Coffee shop"],
    ["0", "Lowongan aktif"],
  ];
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = await createClient();
    const [{ count: baristas }, { count: cafes }, { count: jobs }] = await Promise.all([
      supabase.from("barista_profiles").select("id", { count: "exact", head: true }),
      supabase.from("cafes").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("job_posts").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    return [
      [`${baristas ?? 0}`, "Barista terdaftar"],
      [`${cafes ?? 0}`, "Coffee shop"],
      [`${jobs ?? 0}`, "Lowongan aktif"],
    ];
  } catch {
    return fallback;
  }
}

export default async function LandingPage() {
  const jobs = await getLatestJobs();
  const stats = await getLiveStats();
  const topCities = await getTopCities();
  const seen = new Set();
  const heroPhotos = [];
  for (const j of jobs) {
    const cafe = j.cafes?.name ?? null;
    for (const url of j.cafes?.photo_urls ?? []) {
      if (url && !seen.has(url)) {
        seen.add(url);
        heroPhotos.push({ url, cafe });
      }
    }
  }
  return (
    <div className="paper min-h-screen text-[#2f2721]">
      {/* Hero — nota kafe */}
      <section className="border-b-2 border-dashed border-[#2f2721]/15">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:pt-16 sm:pb-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="text-center lg:text-left">
              <p className="font-chalk text-xl text-[#5f4c37] sm:text-2xl">eh, lagi cari shift?</p>
              <h1 className="font-display mt-2 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
                Lowongan barista, ditempel tiap hari.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#2f2721]/70 sm:text-[15px] lg:mx-0">
                Kayak papan pengumuman di depan kafe — gaji ditulis di depan,
                lamar tinggal klik. Gratis, nggak pakai ribet.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Button href="/jobs" size="lg">
                  Lihat lowongan <ArrowRight size={16} />
                </Button>
                <Button href="/auth/signup" variant="secondary" size="lg">
                  Pasang lowongan — 1 menit
                </Button>
              </div>
              <form action="/jobs" method="GET" className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-full border-2 border-[#2f2721]/15 bg-[#bdb29b] p-1.5 lg:mx-0">
                <div className="flex min-h-[44px] flex-1 items-center gap-2 pl-4">
                  <Search size={16} className="shrink-0 text-[#2f2721]/50" />
                  <input name="q" placeholder="Cari role, skill, atau lokasi..." aria-label="Cari lowongan" className="h-9 w-full bg-transparent text-sm text-[#2f2721] placeholder:text-[#2f2721]/40 focus:outline-none" />
                </div>
                <button type="submit" className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#1e3932] px-6 text-sm font-bold text-white transition-all hover:brightness-125 active:scale-[0.95]">Cari <ArrowRight size={16} /></button>
              </form>
              {topCities.length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#2f2721]/60 lg:justify-start">
                  <MapPin size={13} className="text-[#6f5a3e]" />
                  {topCities.join(" • ")}
                </div>
              )}
            </div>

            {/* Slot foto kafe asli — rotasi tiap 4 detik */}
            <div className="hidden lg:block">
              {heroPhotos.length > 0 ? (
                <HeroPhoto photos={heroPhotos} />
              ) : (
              <figure className="rotate-2 rounded-sm bg-[#c6bba2] p-3 pb-4 shadow-[0_10px_30px_rgba(26,15,10,0.18)]">
                <div className="flex aspect-[4/3] items-center justify-center rounded-[2px] border-2 border-dashed border-[#2f2721]/20 bg-[#a2977f] px-6 text-center">
                  <p className="text-sm leading-6 text-[#2f2721]/55">
                    Foto kafe asli nempel di sini.<br />Bukan gambar AI.
                  </p>
                </div>
                <figcaption className="font-chalk mt-2 text-center text-lg text-[#2f2721]/70">
                  — shift pagi, aroma robusta —
                </figcaption>
              </figure>
              )}
            </div>
          </div>

          {/* stats */}
          <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-center">
            {stats.map(([v, l]) => (
              <div key={l} className="flex flex-col border-t-2 border-[#2f2721]/15 pt-3">
                <dd className="font-display order-1 text-2xl font-semibold sm:text-3xl">{v}</dd>
                <dt className="order-2 mt-1 text-[11px] tracking-wide text-[#2f2721]/60">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Untuk siapa */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: <Store size={20} className="text-[#6f5a3e]" />, title: "Punya coffee shop?", desc: "Nempel lowongan kayak nempel pengumuman di mading — 1 menit jadi, pelamar masuk sendiri." },
            { icon: <Coffee size={20} className="text-[#6f5a3e]" />, title: "Lagi cari shift?", desc: "Isi profil sekali, lamar ke mana-mana. Gaji tertulis jelas sebelum kamu apply." },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border border-[#2f2721]/12 bg-[#bdb29b] p-6 shadow-[0_2px_10px_rgba(26,15,10,0.06)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a2977f]">{s.icon}</div>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-[#2f2721]/65">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Papan lowongan */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="chalkboard rounded-lg p-5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-chalk text-lg text-[#c9b18c]">diupdate tiap ada yang nempel ↓</p>
              <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[#fdf6ec] sm:text-3xl">Papan lowongan hari ini</h2>
            </div>
            <Link
              href="/jobs"
              className="font-chalk inline-flex min-h-[44px] items-center gap-1.5 text-lg text-[#c9b18c] hover:underline"
            >
              lihat semua <ArrowRight size={16} />
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="mt-6 rounded-md border-2 border-dashed border-[#fdf6ec]/25 p-10 text-center">
              <p className="font-chalk text-xl text-[#fdf6ec]/80">papannya masih kosong, bos.</p>
              <p className="mt-1 text-sm text-[#fdf6ec]/60">Jadilah yang pertama nempel lowongan hari ini.</p>
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
                <JobCard key={job.id} job={job} ownerName={job.cafes?.name ?? job.owners?.business_name} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
