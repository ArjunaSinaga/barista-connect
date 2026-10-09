import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Users, Store, MapPin } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import RegisterForm from "./RegisterForm";

export const revalidate = 60;

// REG-20: hanya metrik riil dari backend — tidak pernah angka mockup.
async function getPromoStats() {
  const fallback = [
    { icon: "users", value: "0+", label: "Talenta terverifikasi" },
    { icon: "store", value: "0+", label: "Partner bisnis" },
    { icon: "pin", value: "–", label: "Kota di Indonesia" },
  ];
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = await createClient();
    const [{ count: baristas }, { count: cafes }, { data: locRows }] = await Promise.all([
      supabase.from("baristas_public").select("id", { count: "exact", head: true }),
      supabase.from("cafes").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("baristas_public").select("location_place").limit(1000),
    ]);
    const cities = new Set((locRows ?? []).map((r) => r.location_place).filter(Boolean)).size;
    return [
      { icon: "users", value: `${(baristas ?? 0).toLocaleString("id-ID")}+`, label: "Talenta terverifikasi" },
      { icon: "store", value: `${(cafes ?? 0).toLocaleString("id-ID")}+`, label: "Partner bisnis" },
      { icon: "pin", value: cities > 0 ? `${cities}` : "–", label: "Kota di Indonesia" },
    ];
  } catch {
    return fallback;
  }
}

const STAT_ICONS = { users: Users, store: Store, pin: MapPin };

export default async function RegisterPage() {
  const stats = await getPromoStats();
  return (
    <div className="bg-[#f6f1e5] text-[#2f2721]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* REG-01: kembali ke beranda */}
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-semibold text-[#2f2721]/70 hover:text-[#6f5a3e]"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Kembali ke beranda
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
          {/* Panel promo kiri */}
          <section aria-label="Tentang kerja.inc" className="flex flex-col">
            {/* Kolase foto: IMG-01 besar + IMG-02..05 di-crop per slot */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative min-h-64 overflow-hidden rounded-2xl sm:min-h-80 lg:min-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/landing/barista-1.jpg"
                  alt="Barista kerja.inc meracik kopi"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  loading="eager"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { src: "/images/landing/cafe-4.jpg", alt: "Suasana dinding kafe", pos: "object-center" },
                  { src: "/images/landing/barista-3.jpg", alt: "Staf kafe partner", pos: "object-top" },
                  { src: "/images/landing/barista-2.jpg", alt: "Latte art buatan barista", pos: "object-center" },
                  { src: "/images/landing/cafe-2.jpg", alt: "Interior kafe partner", pos: "object-center" },
                ].map((p) => (
                  <div key={p.src} className="relative aspect-square overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt={p.alt}
                      className={`absolute inset-0 h-full w-full object-cover ${p.pos}`}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-[#2b2118] sm:text-4xl">
              Lebih banyak peluang untuk lebih banyak orang.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#2f2721]/70">
              Dari individu yang ingin berkembang, hingga bisnis yang mencari talenta terbaik — semua
              bertemu di kerja.inc.
            </p>

            {/* REG-20: statistik live */}
            <dl className="mt-6 space-y-4">
              {stats.map((s) => {
                const Icon = STAT_ICONS[s.icon];
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9dcc2] text-[#6f5a3e]">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="sr-only">{s.label}</dt>
                      <dd className="text-lg leading-tight font-extrabold text-[#2b2118]">{s.value}</dd>
                      <dd className="text-xs text-[#2f2721]/60">{s.label}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </section>

          {/* Kartu form kanan */}
          <section
            aria-label="Formulir pendaftaran"
            className="h-fit rounded-3xl border border-[#e8e0cf] bg-white p-6 shadow-[0_2px_16px_rgba(43,33,24,0.10)] sm:p-8"
          >
            <Suspense fallback={null}>
              <RegisterForm />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}
