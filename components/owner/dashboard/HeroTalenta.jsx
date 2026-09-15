import Link from "next/link";
import { Search } from "lucide-react";

// Hero dashboard owner ala mockup: headline + cari talenta + filter cepat + foto cafe.
export const QUICK_FILTERS = [
  "Available Now",
  "Rating 4.5+",
  "Full-time",
  "Part-time",
  "Latte Art",
  "Manual Brew",
];

export default function HeroTalenta({ photo, cafeName }) {
  return (
    <div className="flex gap-0 overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#ece2cd] py-2.5 pr-0 pl-5 shadow-[0_2px_12px_rgba(43,33,24,0.10)] sm:pl-6">
      <div className="min-w-0 flex-1 pr-5">
        <h1 className="font-display text-xl leading-[1.05] font-semibold tracking-tight sm:text-2xl">
          Hire better baristas. <span className="text-[#1f6b4a]">Build a stronger cafe team.</span>
        </h1>
        <p className="mt-1 max-w-xl text-xs leading-5 text-[#6f6252]">
          Temukan barista berbakat dengan pengalaman terverifikasi, rating dari pemilik cafe lain,
          dan pelatihan industri terkemuka.
        </p>
        <form action="/find-baristas" method="GET" className="mt-2 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-4 py-1.5">
            <Search size={14} className="shrink-0 text-[#b6a98f]" />
            <input
              name="q"
              placeholder="Cari barista berdasarkan nama, keahlian, atau lokasi..."
              aria-label="Cari barista"
              className="h-6 w-full bg-transparent text-xs text-[#2b2118] placeholder:text-[#b6a98f] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[34px] shrink-0 items-center rounded-full bg-[#3d2c1e] px-4 text-xs font-bold text-white hover:bg-[#2e2015]"
          >
            Cari Talenta
          </button>
        </form>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#857768]">Filter Cepat:</span>
          {QUICK_FILTERS.map((f) => (
            <Link
              key={f}
              href="/find-baristas"
              className="rounded-full border border-[#e0d5bd] bg-[#ffffff] px-2.5 py-0.5 text-[11px] font-bold text-[#6f6252] hover:border-[#3d2c1e] hover:text-[#3d2c1e]"
            >
              {f}
            </Link>
          ))}
        </div>
      </div>
      <div className="relative hidden w-56 shrink-0 self-stretch sm:block lg:w-64">
        {photo ? (
          <>
            <img src={photo} alt={cafeName ?? "Cafe"} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <span className="font-chalk absolute top-4 left-4 -rotate-6 text-xl leading-5 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              Great<br />Baristas<br />Greater<br />Stories
            </span>
            <span className="absolute right-3 bottom-3 rounded-full bg-[#f5f1e8]/95 px-4 py-2 text-right shadow">
              <span className="font-chalk block text-sm leading-4 text-[#3d2c1e]">Same Passion<br />More People</span>
            </span>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#e5dcc4] px-6 text-center">
            <p className="text-sm leading-6 text-[#857768]">Tambahkan foto cafe di Cafe Saya.</p>
          </div>
        )}
      </div>
    </div>
  );
}
