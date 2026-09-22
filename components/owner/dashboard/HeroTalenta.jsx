import Image from "next/image";
import { Search, Star, Briefcase, Clock, Coffee, CupSoda, MapPin } from "lucide-react";
import FilterPills from "@/components/ui/FilterPills";

// Hero dashboard owner ala mockup: headline + cari talenta + filter cepat + foto kafe.
export const QUICK_FILTERS = [
  { label: "Siap Kerja", href: "/find-baristas?available=1", icon: "dot" },
  { label: "Rating 4.5+", href: "/find-baristas?minRating=4.5", icon: Star },
  { label: "Penuh Waktu", href: "/find-baristas?type=full-time", icon: Briefcase },
  { label: "Paruh Waktu", href: "/find-baristas?type=part-time", icon: Clock },
  { label: "Seni Latte", href: "/find-baristas?q=Latte%20Art", icon: Coffee },
  { label: "Seduh Manual", href: "/find-baristas?q=Manual%20Brew", icon: CupSoda },
];

export default function HeroTalenta({ photo, cafeName, cafeLocation }) {
  return (
    <div className="flex gap-0 overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#ece2cd] py-2 pr-0 pl-5 shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:pl-6">
      <div className="min-w-0 flex-1 py-0.5 pr-5">
        <h1 className="font-display text-balance text-lg leading-[1.05] font-semibold tracking-tight sm:text-xl">
          Rekrut barista hebat. <span className="text-matcha">Bangun tim kafe yang solid.</span>
        </h1>
        <p className="mt-1 max-w-[52ch] text-xs leading-5 text-espresso-soft">
          Temukan barista berbakat dengan pengalaman terverifikasi, rating dari pemilik kafe lain,
          dan pelatihan industri terkemuka.
        </p>
        <form action="/find-baristas" method="GET" role="search" aria-label="Cari barista" className="mt-1.5 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e0d5bd] bg-white px-4 py-1.5 focus-within:border-coffee">
            <Search size={14} className="shrink-0 text-[#b6a98f]" aria-hidden="true" />
            <label htmlFor="hero-talent-q" className="sr-only">Cari barista berdasarkan nama, keahlian, atau lokasi</label>
            <input
              id="hero-talent-q"
              name="q"
              placeholder="Cari barista berdasarkan nama, keahlian, atau lokasi..."
              autoComplete="off"
              className="h-6 w-full bg-transparent text-xs text-espresso placeholder:text-[#b6a98f] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[34px] shrink-0 items-center rounded-full bg-coffee px-4 text-xs font-bold text-white transition-colors hover:bg-[#2e2015] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d2c1e]"
          >
            Cari Talenta
          </button>
        </form>
        <FilterPills
          items={[
            ...QUICK_FILTERS,
            ...(cafeLocation
              ? [{ label: cafeLocation, href: `/find-baristas?loc=${encodeURIComponent(cafeLocation)}`, icon: MapPin, short: true }]
              : []),
          ]}
        />
      </div>
      <div className="relative hidden w-56 shrink-0 self-stretch sm:block lg:w-64">
        {photo ? (
          <Image src={photo} alt={cafeName ?? "Foto kafe"} fill sizes="256px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#e0d5bd] px-4 text-center">
            <p className="text-[11px] leading-5 text-espresso-soft">Foto kafemu tampil di sini setelah ditambahkan di Kafe Saya.</p>
          </div>
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <span className="font-chalk absolute top-4 left-4 -rotate-6 text-xl leading-5 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          Barista<br />Hebat<br />Cerita<br />Hebat
        </span>
        <span className="absolute right-3 bottom-3 rounded-full bg-paper/95 px-4 py-2 text-right shadow">
          <span className="font-chalk block text-sm leading-4 text-espresso">Satu Gairah<br />Makin Ramai</span>
        </span>
      </div>
    </div>
  );
}
