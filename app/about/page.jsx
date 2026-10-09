import Link from "next/link";

export const metadata = { title: "Tentang Kami" };

// LP-01/LP-21: halaman About — profil marketplace nyata, tanpa klaim fiktif.
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-extrabold tracking-wide text-caramel uppercase">Tentang Kami</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-espresso">Talenta lokal untuk Indonesia yang lebih kuat.</h1>
      <p className="mt-3 text-sm leading-7 text-espresso-soft">
        kerja.inc adalah marketplace perekrutan untuk pekerja frontline dan hospitality Indonesia —
        barista, front office, server, dan lainnya. Pekerja membangun profil terverifikasi, melamar
        lowongan, dan mengumpulkan reputasi lewat ulasan. Pemilik usaha memasang lowongan,
        menyaring pelamar, dan membangun tim lewat dashboard.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Untuk Pekerja", "Profil, lamaran, dan reputasi dalam satu tempat.", "/register?role=barista", "Buat Profil"],
          ["Untuk Bisnis", "Pasang lowongan dan kelola pelamar.", "/register?role=owner", "Pasang Lowongan"],
          ["Kepercayaan", "Verifikasi identitas dan ulasan termoderasi.", "/trust", "Cara Kerja Trust"],
        ].map(([t, d, href, cta]) => (
          <div key={t} className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
            <p className="text-sm font-extrabold text-espresso">{t}</p>
            <p className="mt-1 text-xs leading-5 text-espresso-soft">{d}</p>
            <Link href={href} className="mt-3 inline-block text-xs font-bold text-link hover:underline">{cta} →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
