import Link from "next/link";

export const metadata = { title: "FAQ" };

const GROUPS = [
  {
    title: "Pekerja",
    items: [
      ["Bagaimana cara melamar?", "Buka lowongan di /jobs, klik Lamar Sekarang, lengkapi cover note dan CV, lalu kirim. Pantau status di Lamaran Saya."],
      ["Apakah melamar gratis?", "Ya. Membuat profil, melamar, dan menyimpan lowongan gratis."],
      ["Bagaimana verifikasi identitas?", "Buka /verify dan ikuti langkahnya. Badge tampil setelah disetujui."],
      ["Di mana saya lihat undangan interview?", "Perusahaan menghubungimu lewat Pesan. Notifikasi update juga masuk ke /dashboard/barista/notifikasi."],
    ],
  },
  {
    title: "Pemilik Usaha",
    items: [
      ["Bagaimana cara pasang lowongan?", "Masuk sebagai owner, buka Buat Lowongan, isi 4 langkah wizard, lalu terbitkan. Langsung tayang tanpa biaya."],
      ["Bagaimana cara melihat pelamar?", "Buka dashboard → Pelamar, atau Kelola Lowongan untuk jumlah per loker."],
      ["Bagaimana cara mengundang tim?", "Buka dashboard → Tim & Akses (tab PT/Organisasi) dan undang via email sebagai Manager/Viewer."],
    ],
  },
  {
    title: "Akun & Keamanan",
    items: [
      ["Saya lupa password, bagaimana?", "Gunakan Lupa Password di halaman login untuk reset via email."],
      ["Bisakah satu akun untuk dua peran?", "Ya. Satu identitas bisa memegang peran barista dan owner; pengalihannya eksplisit, tanpa akun ganda."],
      ["Ke mana melaporkan lowongan mencurigakan?", "Hubungi kami lewat Pesan ke tim atau email resmi yang tercantum di /trust."],
    ],
  },
];

// LP-01/LP-21: halaman FAQ — jawaban sesuai kemampuan produk nyata.
export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-extrabold tracking-wide text-caramel uppercase">Bantuan</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-espresso">Pertanyaan Umum</h1>
      {GROUPS.map((g) => (
        <section key={g.title} className="mt-6">
          <h2 className="text-base font-extrabold text-espresso">{g.title}</h2>
          <div className="mt-2 space-y-2">
            {g.items.map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-[#e8e0cf] bg-white px-5 py-3.5">
                <summary className="cursor-pointer text-sm font-extrabold text-espresso">{q}</summary>
                <p className="mt-1.5 text-sm leading-6 text-espresso-soft">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      <p className="mt-6 text-sm text-espresso-soft">
        Masih butuh bantuan? Lihat <Link href="/trust" className="font-bold text-link hover:underline">kebijakan trust</Link> atau mulai dari <Link href="/" className="font-bold text-link hover:underline">beranda</Link>.
      </p>
    </div>
  );
}
