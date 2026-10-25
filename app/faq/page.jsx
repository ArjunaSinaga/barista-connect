import Link from "next/link";
import { CircleHelp, Mail } from "lucide-react";

export const metadata = { title: "Pertanyaan Umum" };

const SECTIONS = [
  {
    title: "Akun & Pendaftaran",
    items: [
      {
        q: "Bagaimana cara membuat akun?",
        a: "Buka halaman Daftar, pilih peran (Pencari Kerja, Pemberi Kerja, atau Mitra Academy), isi email dan password, lalu setujui Syarat & Ketentuan. Setelah itu verifikasi email dan lengkapi profil.",
      },
      {
        q: "Bisa daftar pakai akun Google?",
        a: "Bisa. Tekan Lanjut dengan Google di halaman Daftar. Pastikan peran sudah dipilih sebelum melanjutkan agar akun dibuat dengan peran yang benar.",
      },
      {
        q: "Satu akun bisa punya lebih dari satu peran?",
        a: "Bisa. Satu identitas dapat memiliki lebih dari satu peran dengan verifikasi terpisah. Peran tambahan ditambahkan secara eksplisit, bukan dengan membuat akun baru.",
      },
      {
        q: "Email sudah terdaftar, bagaimana?",
        a: "Jika email sudah terdaftar, sistem mengarahkanmu ke halaman Masuk. Gunakan fitur lupa password bila lupa kata sandi. Sistem tidak akan membuat akun ganda.",
      },
    ],
  },
  {
    title: "Pencari Kerja",
    items: [
      {
        q: "Apakah melamar kerja dikenakan biaya?",
        a: "Tidak. Membuat profil dan melamar pekerjaan gratis untuk pencari kerja.",
      },
      {
        q: "Bagaimana cara mencari lowongan?",
        a: "Gunakan kolom pencarian di beranda atau halaman Loker. Isi kata kunci dan/atau lokasi, lalu tekan Find Jobs. Hasil tampil di halaman pencarian sesuai kata kunci dan lokasi.",
      },
      {
        q: "Apa arti badge terverifikasi di profil?",
        a: "Badge terverifikasi menandai identitas atau pengalaman yang sudah melewati proses verifikasi. Informasi yang diisi sendiri tidak diberi gaya terverifikasi.",
      },
    ],
  },
  {
    title: "Bisnis & Pemberi Kerja",
    items: [
      {
        q: "Bagaimana cara memasang lowongan?",
        a: "Daftar sebagai Pemberi Kerja, lengkapi data perusahaan dan outlet, lalu buat lowongan dari dashboard. Lowongan aktif muncul di halaman Loker setelah dipublikasikan.",
      },
      {
        q: "Apa arti badge terverifikasi pada bisnis?",
        a: "Badge muncul hanya jika status verifikasi perusahaan atau outlet sudah disetujui. Badge tidak pernah berasal dari penanda di sisi tampilan saja.",
      },
    ],
  },
  {
    title: "Keamanan & Verifikasi",
    items: [
      {
        q: "Bagaimana data saya dilindungi?",
        a: "Data sensitif seperti nomor identitas perusahaan disimpan dengan klasifikasi privat dan tidak ditampilkan publik. Rincian kebijakan ada di halaman Kebijakan Privasi.",
      },
      {
        q: "Di mana saya bisa membaca kebijakan platform?",
        a: "Kebijakan Trust, Syarat & Ketentuan, dan Kebijakan Privasi tersedia melalui tautan di bagian bawah halaman dan di Pusat Bantuan.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.18em] text-espresso-soft uppercase">
        FAQ
      </p>
      <h1 className="mt-1 font-serif text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
        Pertanyaan yang sering diajukan
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-espresso-soft">
        Jawaban singkat seputar akun, melamar kerja, memasang lowongan, dan keamanan di
        kerja.inc. Belum menemukan jawabannya? Kunjungi Pusat Bantuan atau hubungi support.
      </p>

      <div className="mt-6 space-y-4">
        {SECTIONS.map((sec) => (
          <section
            key={sec.title}
            className="rounded-3xl border border-[#e8e0cf] bg-white p-5 sm:p-6"
          >
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-espresso">
              <CircleHelp size={20} className="text-caramel" /> {sec.title}
            </h2>
            <div className="mt-4 space-y-3">
              {sec.items.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-[#ece4d0] bg-[#faf6ec] px-4 py-3"
                >
                  <summary className="cursor-pointer text-sm font-bold text-espresso">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-espresso-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-espresso">
          <Mail size={18} className="text-caramel" /> Masih butuh bantuan?
        </h2>
        <p className="mt-1 text-sm leading-6 text-espresso-soft">
          Lihat Pusat Bantuan untuk masalah akun seperti lupa password dan verifikasi email,
          atau kirim email ke support kami.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/help"
            className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-coffee px-5 text-sm font-bold text-white hover:bg-[#2e2015]"
          >
            Ke Pusat Bantuan
          </Link>
          <a
            href="mailto:support@kerja.inc"
            className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-coffee px-5 text-sm font-bold text-coffee"
          >
            support@kerja.inc
          </a>
        </div>
      </div>
    </div>
  );
}
