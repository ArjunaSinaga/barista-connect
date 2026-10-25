import Link from "next/link";
import { ShoppingBag, Store, GraduationCap, ShieldCheck, Star, BadgeCheck } from "lucide-react";

export const metadata = { title: "Tentang kerja.inc" };

const AUDIENCES = [
  {
    icon: ShoppingBag,
    title: "Pencari Kerja",
    desc: "Talenta frontline dan hospitality membuat profil, menampilkan pengalaman, lalu melamar pekerjaan kasual maupun tetap.",
  },
  {
    icon: Store,
    title: "Bisnis & Kafe",
    desc: "Pemilik usaha memasang lowongan, menyeleksi pelamar, dan mengelola rekrutmen untuk satu atau banyak outlet.",
  },
  {
    icon: GraduationCap,
    title: "Mitra Academy",
    desc: "Penyedia pelatihan menawarkan kelas untuk meningkatkan keterampilan talenta sebelum masuk dunia kerja.",
  },
];

const TRUST = [
  {
    icon: BadgeCheck,
    title: "Verifikasi Identitas",
    desc: "Setiap worker dan bisnis melalui proses verifikasi sebelum ditampilkan sebagai akun terverifikasi di platform.",
  },
  {
    icon: ShieldCheck,
    title: "Pengalaman Tervalidasi",
    desc: "Riwayat kerja dan keterampilan yang sudah diverifikasi dibedakan jelas dari klaim yang diisi sendiri.",
  },
  {
    icon: Star,
    title: "Rating & Ulasan Terkurasi",
    desc: "Ulasan berasal dari pengguna yang benar-benar bertransaksi, sehingga kepercayaan tumbuh dari komunitas.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.18em] text-espresso-soft uppercase">
        Tentang kerja.inc
      </p>
      <h1 className="mt-1 font-serif text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
        Marketplace kerja untuk talenta frontline Indonesia
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-espresso-soft">
        kerja.inc mempertemukan talenta frontline dan hospitality dengan bisnis yang
        sedang merekrut. Mulai dari barista dan staff F&amp;B, front office, hingga
        posisi hospitality lainnya, semuanya bertemu dalam satu tempat yang terverifikasi.
      </p>

      <section aria-labelledby="untuk-siapa" className="mt-8">
        <h2 id="untuk-siapa" className="font-serif text-xl font-bold text-espresso">
          Siapa yang memakai kerja.inc
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-3xl border border-[#e8e0cf] bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9dcc2] text-[#6f5a3e]">
                <Icon size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-bold text-[#2b2118]">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-espresso-soft">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="kepercayaan" className="mt-8">
        <h2 id="kepercayaan" className="font-serif text-xl font-bold text-espresso">
          Kenapa bisa dipercaya
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-espresso-soft">
          Kepercayaan dibangun dari verifikasi yang nyata, bukan klaim di halaman depan.
          Selengkapnya ada di{" "}
          <Link href="/trust" className="font-bold text-[#2b2118] underline underline-offset-2 hover:text-[#6f5a3e]">
            halaman Kebijakan Trust
          </Link>
          .
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {TRUST.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-3xl border border-[#e8e0cf] bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f0e8] text-matcha">
                <Icon size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-bold text-[#2b2118]">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-espresso-soft">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
        <h2 className="font-serif text-lg font-bold text-espresso">Mulai sekarang, gratis</h2>
        <p className="mt-1 text-sm leading-6 text-espresso-soft">
          Buat akun sebagai pencari kerja atau pasang lowongan sebagai bisnis. Tidak ada
          biaya untuk memulai.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/register?role=barista"
            className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-coffee px-5 text-sm font-bold text-white hover:bg-[#2e2015]"
          >
            Daftar sebagai Pencari Kerja
          </Link>
          <Link
            href="/register?role=owner"
            className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-coffee px-5 text-sm font-bold text-coffee hover:bg-coffee hover:text-white"
          >
            Pasang Lowongan
          </Link>
        </div>
      </section>

      <p className="mt-6 text-sm text-espresso-soft">
        Ada pertanyaan? Lihat{" "}
        <Link href="/faq" className="font-bold text-[#2b2118] underline underline-offset-2 hover:text-[#6f5a3e]">
          FAQ
        </Link>{" "}
        atau{" "}
        <Link href="/help" className="font-bold text-[#2b2118] underline underline-offset-2 hover:text-[#6f5a3e]">
          Pusat Bantuan
        </Link>
        .
      </p>
    </div>
  );
}
