"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CITIES, EMPLOYMENT_TYPES } from "@/lib/constants";

// Baris dropdown filter ala mockup UI-05 (H-13..H-18): Urutan, Jenis, Gaji, Lokasi, Shift, Lainnya.
// Tiap perubahan: tulis ke URL (?sort ?type ?pay ?loc ?shift ?verified ?hasSalary), halaman server render ulang.
export default function JobsFilterBar({ sort, type, pay, loc, shift, verified, hasSalary }) {
  const router = useRouter();
  const params = useSearchParams();

  function set(key, v) {
    const next = new URLSearchParams(params.toString());
    if (v) next.set(key, v);
    else next.delete(key);
    next.delete("job");
    router.push(`/jobs?${next.toString()}`, { scroll: false });
  }

  const sel =
    "cursor-pointer rounded-full border border-[#e0d5bd] bg-white px-2.5 py-1.5 text-[11px] font-bold text-espresso outline-none max-w-32";

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter lowongan">
      <label className="sr-only" htmlFor="f-sort">Urutan</label>
      <select id="f-sort" value={sort} onChange={(e) => set("sort", e.target.value)} className={sel} title="Urutan">
        <option value="newest">Urutan: Terbaru</option>
        <option value="oldest">Urutan: Terlama</option>
        <option value="name">Urutan: Nama A–Z</option>
      </select>

      <label className="sr-only" htmlFor="f-type">Jenis Pekerjaan</label>
      <select id="f-type" value={type} onChange={(e) => set("type", e.target.value)} className={sel} title="Jenis Pekerjaan">
        <option value="">Jenis: Semua</option>
        {EMPLOYMENT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>Jenis: {t.label}</option>
        ))}
      </select>

      <label className="sr-only" htmlFor="f-pay">Gaji</label>
      <select id="f-pay" value={pay} onChange={(e) => set("pay", e.target.value)} className={sel} title="Gaji (setara bulanan)">
        <option value="">Gaji: Semua</option>
        <option value="lt3">&lt; Rp 3 jt</option>
        <option value="35">Rp 3–5 jt</option>
        <option value="gt5">&gt; Rp 5 jt</option>
      </select>

      <label className="sr-only" htmlFor="f-loc">Lokasi</label>
      <select id="f-loc" value={loc} onChange={(e) => set("loc", e.target.value)} className={sel} title="Lokasi">
        <option value="">Lokasi: Semua</option>
        {CITIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label className="sr-only" htmlFor="f-shift">Shift</label>
      <select id="f-shift" value={shift} onChange={(e) => set("shift", e.target.value)} className={sel} title="Shift">
        <option value="">Shift: Semua</option>
        <option value="pagi">Pagi</option>
        <option value="siang">Siang</option>
        <option value="malam">Malam</option>
        <option value="fleksibel">Fleksibel</option>
      </select>

      <label className="sr-only" htmlFor="f-more">Lainnya</label>
      <select
        id="f-more"
        value={verified ? "verified" : hasSalary ? "hassalary" : ""}
        onChange={(e) => {
          const v = e.target.value;
          const next = new URLSearchParams(params.toString());
          next.delete("verified");
          next.delete("hasSalary");
          next.delete("job");
          if (v === "verified") next.set("verified", "1");
          if (v === "hassalary") next.set("hasSalary", "1");
          router.push(`/jobs?${next.toString()}`, { scroll: false });
        }}
        className={sel}
        title="Filter lainnya"
      >
        <option value="">Lainnya</option>
        <option value="verified">Perusahaan terverifikasi</option>
        <option value="hassalary">Ada info gaji</option>
      </select>
    </div>
  );
}
