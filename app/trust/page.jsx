import Link from "next/link";
import { ShieldCheck, Star, GraduationCap, ThumbsUp, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Cara Kerja Kepercayaan | kerja.inc",
  description: "Bagaimana kerja.inc membangun kepercayaan: riwayat kerja terverifikasi, ulasan asli kafe, sertifikasi academy, dan endorse skill.",
};

const MECHANISMS = [
  {
    icon: <ShieldCheck size={22} className="text-matcha" />,
    tint: "bg-[#e3f0e8]",
    title: "Riwayat kerja terverifikasi kafe",
    desc: "Pengalaman tampil di profil hanya bila kafe terkait mencatat barista sebagai anggota tim. Klaim sepihak tanpa catatan kafe tidak tampil sebagai riwayat terverifikasi.",
    href: "/find-baristas",
    cta: "Lihat talenta",
  },
  {
    icon: <Star size={22} className="text-[#8a6d1f]" />,
    tint: "bg-[#f5ecd4]",
    title: "Ulasan dan rating asli pemberi kerja",
    desc: "Rating hanya bisa diberikan pemilik kafe yang pernah bekerja dengan barista tersebut. Tidak ada ulasan anonim, tidak ada ulasan berbayar.",
    href: "/reviews",
    cta: "Baca ulasan",
  },
  {
    icon: <GraduationCap size={22} className="text-matcha" />,
    tint: "bg-[#e3f0e8]",
    title: "Sertifikasi academy",
    desc: "Barista lulusan pelatihan tersertifikasi kerja.inc. Sertifikat bisa dicek keasliannya lewat halaman verifikasi.",
    href: "/verify-cert",
    cta: "Verifikasi sertifikat",
  },
  {
    icon: <ThumbsUp size={22} className="text-matcha" />,
    tint: "bg-[#e3f0e8]",
    title: "Endorse skill antar pengguna",
    desc: "Satu pengguna satu suara per skill. Jumlah endorse tampil apa adanya di profil — tidak bisa dibeli, tidak bisa dipalsukan massal.",
    href: "/find-baristas",
    cta: "Lihat profil barista",
  },
];

export default function TrustPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-widest text-matcha uppercase">Kepercayaan</p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-espresso sm:text-4xl">
        Cara kerja kepercayaan di kerja.inc
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-espresso-soft">
        Merekrut orang asing itu berisiko. Empat mekanisme di bawah ini memastikan
        setiap klaim di profil barista bisa dilacak sumbernya — bukan sekadar tulisan.
      </p>

      <div className="mt-8 space-y-4">
        {MECHANISMS.map((m, i) => (
          <section
            key={m.title}
            className="rounded-2xl border border-[#e8e0cf] bg-white p-5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]"
          >
            <div className="flex items-start gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${m.tint}`}>
                {m.icon}
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-espresso">
                  {i + 1}. {m.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-espresso-soft">{m.desc}</p>
                <Link
                  href={m.href}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-link hover:underline"
                >
                  {m.cta} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-coffee p-6 text-center text-white">
        <h2 className="font-display text-xl font-semibold">Mulai merekrut dengan percaya diri</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-white/80">
          Pasang loker gratis dan terima lamaran dari barista terverifikasi.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/register?role=owner"
            className="inline-flex min-h-[44px] items-center rounded-full bg-white px-6 text-sm font-bold text-coffee hover:bg-[#f5efe0]"
          >
            Daftar sebagai pemilik kafe
          </Link>
          <Link
            href="/jobs"
            className="inline-flex min-h-[44px] items-center rounded-full border border-white/40 px-6 text-sm font-bold text-white hover:bg-white/10"
          >
            Lihat loker
          </Link>
        </div>
      </div>
    </main>
  );
}
