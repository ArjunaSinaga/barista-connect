import Link from "next/link";
import { ArrowRight, Coffee, Store } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import JobCard from "@/components/cards/JobCard";
import Button from "@/components/ui/Button";

async function getLatestJobs() {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("job_posts")
      .select("*, owners(business_name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const jobs = await getLatestJobs();

  const steps = [
    {
      icon: <Store className="text-caramel" size={22} />,
      title: "Pemilik Coffee Shop",
      desc: "Pasang lowongan dalam 1 menit, review pelamar, terima barista terbaik.",
    },
    {
      icon: <Coffee className="text-caramel" size={22} />,
      title: "Barista",
      desc: "Lengkapi profil sekali, lamar semua lowongan yang cocok. Gratis.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-latte/50 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute top-40 -left-20 h-56 w-56 rounded-full bg-caramel/10 blur-2xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-latte bg-white px-4 py-1.5 text-xs font-bold text-espresso-soft shadow-sm">
            ☕ Komunitas barista Indonesia
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl leading-tight font-extrabold tracking-tight text-espresso sm:text-5xl">
            Cari kerja <span className="text-caramel">barista</span> di dekat
            kamu
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-espresso-soft">
            Hubungan langsung antara barista dan pemilik coffee shop. Tanpa
            perantara, tanpa biaya — cukup lengkapi profil dan mulai melamar.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/jobs" size="lg" full>
              Lihat Lowongan <ArrowRight size={18} />
            </Button>
            <Button href="/signup?role=owner" variant="secondary" size="lg" full>
              Saya punya coffee shop
            </Button>
          </div>
        </div>
      </section>

      {/* Latest jobs */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-espresso">
              Lowongan Terbaru
            </h2>
            <p className="text-sm text-espresso-soft">
              Yang paling baru dibuka hari ini
            </p>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-sm font-bold text-caramel hover:underline"
          >
            Semua <ArrowRight size={15} />
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                ownerName={job.owners?.business_name}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-latte bg-white/60 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-espresso">
              Belum ada lowongan yang tampil
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs text-espresso-soft">
              Belum terhubung ke database? Ikuti SETUP.md untuk membuat project
              Supabase gratis, atau daftar sebagai pemilik coffee shop untuk
              memasang lowongan pertama.
            </p>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-t border-latte/60 bg-white/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2">
          {steps.map((s) => (
            <div
              key={s.title}
              className="flex items-start gap-4 rounded-2xl border border-latte bg-white p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream-dark">
                {s.icon}
              </span>
              <div>
                <h3 className="font-bold text-espresso">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-espresso-soft">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
