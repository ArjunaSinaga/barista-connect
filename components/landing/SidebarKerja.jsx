import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Star, GraduationCap, BarChart3, ChevronRight } from "lucide-react";
import WaitlistButton from "@/components/training/WaitlistButton";

// Tiap blok mandiri (kartu putih sendiri). Tanpa DB — statis kecuali foto.
const ITEMS = [
  { icon: <ShieldCheck size={18} className="text-matcha" />, tint: "bg-[#e3f0e8]", title: "Pengalaman Terverifikasi", desc: "Riwayat kerja diverifikasi kafe", href: "/find-baristas" },
  { icon: <Star size={18} className="text-[#8a6d1f]" />, tint: "bg-[#f5ecd4]", title: "Ulasan & Rating Kafe", desc: "Penilaian asli dari pemberi kerja", href: "/reviews" },
  { icon: <GraduationCap size={18} className="text-matcha" />, tint: "bg-[#e3f0e8]", title: "Talenta Hasil Pelatihan", desc: "Barista dilatih dan disertifikasi BaristaConnect", href: "/training" },
  { icon: <BarChart3 size={18} className="text-matcha" />, tint: "bg-[#e3f0e8]", title: "Rekap Hadir & Shift", desc: "Pantau kehadiran dan reliabilitas tim", badge: "Segera hadir", href: null },
];

function EcosystemRow({ it }) {
  const body = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${it.tint}`}>{it.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[13px] font-extrabold text-espresso">
          <span className="truncate">{it.title}</span>
          {it.badge && (
            <span className="shrink-0 rounded-full bg-[#e3ecf5] px-2 py-0.5 text-[10px] font-bold text-[#2b5f8a]">{it.badge}</span>
          )}
        </span>
        <span className="block truncate text-[11px] text-espresso-soft">{it.desc}</span>
      </span>
      {it.href ? <ChevronRight size={15} className="shrink-0 text-[#b6a98f]" aria-hidden="true" /> : null}
    </>
  );
  if (!it.href) {
    return <span className="flex items-center gap-3 rounded-xl px-2 py-2 opacity-80">{body}</span>;
  }
  return <Link href={it.href} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#faf7ef]">{body}</Link>;
}

export function EcosystemCard() {
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-white p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:min-h-full">
      <h3 className="text-sm font-extrabold text-espresso">Lebih dari papan loker</h3>
      <p className="mt-0.5 text-xs text-espresso-soft">Ekosistem rekrutmen kopi yang lengkap.</p>
      <ul className="mt-2 space-y-1">
        {ITEMS.map((it) => (
          <li key={it.title}>
            <EcosystemRow it={it} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AcademyCard({ image }) {
  const points = ["Pemula sampai Mahir", "Belajar dari Praktisi Industri", "Sertifikasi BaristaConnect"];
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-white p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:min-h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-espresso">BaristaConnect Academy</h3>
        <Link href="/training" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-link hover:underline">
          Lihat semua kursus <ChevronRight size={13} />
        </Link>
      </div>
      <div className="mt-2 grid grid-cols-2 items-stretch gap-2">
        <div className="min-w-0">
          <p className="text-[15px] leading-6 font-extrabold text-espresso">Pelatihan barista untuk hari esok yang cerah.</p>
          <p className="mt-1 text-xs leading-5 text-espresso-soft">
            Dari pemula sampai mahir, kursus berbasis industri membantu barista membangun skill asli dan kepercayaan diri siap kafe.
          </p>
          <Link href="/training" className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-full bg-coffee px-5 text-[13px] font-bold text-white hover:bg-[#2e2015]">
            Jelajahi Kursus
          </Link>
        </div>
        <div className="relative min-h-44 overflow-hidden rounded-xl">
          {image ? (
            <Image src={image} alt="Barista training" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#ece2cd] px-4 text-center">
              <GraduationCap size={26} className="text-[#9a6a2f]" />
              <p className="text-[11px] font-bold text-espresso-soft">Foto training asli menyusul</p>
            </div>
          )}
          <ul className="absolute top-2 left-2 space-y-1 rounded-lg bg-white/95 p-2 shadow">
            {points.map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-[10px] leading-3 font-semibold text-espresso">
                <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#e3f0e8] text-[9px] font-bold text-matcha">✓</span>{t}
              </li>
            ))}
          </ul>
          <span className="absolute right-2 bottom-2 flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-[#c9a227] px-1 text-center text-[8px] leading-tight font-extrabold text-white shadow">
            CERTIFIED BY BARISTACONNECT
          </span>
        </div>
      </div>
    </div>
  );
}

export function SmarterOpsCard() {
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-white p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:min-h-full">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-espresso">Untuk Pemilik Kafe: Operasional Cerdas</h3>
        <span className="shrink-0 rounded-full bg-[#e3ecf5] px-2 py-0.5 text-[10px] font-bold text-[#2b5f8a]">Segera Hadir</span>
      </div>
      <p className="mt-1 text-[15px] leading-6 font-extrabold text-espresso">Lihat lebih dari sekadar talenta. Bangun tim lebih baik.</p>
      <p className="mt-1 text-xs leading-5 text-espresso-soft">
        Pantau kehadiran, shift, dan skor reliabilitas. Ambil keputusan berbasis data dan jalankan kafe lebih rapi.
      </p>
      <div className="mt-3 rounded-xl border-2 border-dashed border-[#e0d5bd] bg-[#faf7ef] p-4 text-center">
        <p className="text-xs font-extrabold text-espresso">Ringkasan Tim</p>
        <p className="mx-auto mt-1 max-w-55 text-[11px] leading-4 text-espresso-soft">
          Pratinjau tampilan — grafik kehadiran &amp; reliabilitas tim tampil di sini saat fitur rilis. Tanpa angka contoh.
        </p>
      </div>
      <WaitlistButton topic="smarter-ops" label="Ikut Daftar Tunggu" outline className="mt-3 w-full" />
    </div>
  );
}
