import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan — kerja.inc",
  description: "Syarat dan ketentuan penggunaan platform kerja.inc.",
};

// REG-11: dibuka dari checkbox pendaftaran di tab baru agar state form utuh.
export default function TermsPage() {
  return (
    <div className="bg-[#f6f1e5] text-[#2f2721]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/register"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-semibold text-[#2f2721]/70 hover:text-[#6f5a3e]"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Kembali ke pendaftaran
        </Link>
        <article className="mt-4 rounded-3xl border border-[#e8e0cf] bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2b2118]">Syarat &amp; Ketentuan</h1>
          <p className="mt-1 text-sm text-[#2f2721]/60">Terakhir diperbarui: Oktober 2026</p>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#2f2721]/85">
            <section>
              <h2 className="font-bold text-[#2b2118]">1. Akun</h2>
              <p className="mt-1">
                Satu identitas email hanya memiliki satu akun. Satu akun dapat memegang lebih dari
                satu peran (pencari kerja, pemberi kerja, mitra academy) tanpa membuat akun baru.
                Anda wajib memberikan data yang benar dan menjaga kerahasiaan password.
              </p>
            </section>
            <section>
              <h2 className="font-bold text-[#2b2118]">2. Verifikasi</h2>
              <p className="mt-1">
                Akun baru wajib memverifikasi kepemilikan email atau nomor telepon sebelum dapat
                melamar, memasang loker, atau menerbitkan sertifikat.
              </p>
            </section>
            <section>
              <h2 className="font-bold text-[#2b2118]">3. Perilaku</h2>
              <p className="mt-1">
                Dilarang memasang loker fiktif, memalsukan identitas atau sertifikat, mengirim spam,
                dan menyalahgunakan fitur pesan atau ulasan. Pelanggaran dapat berujung pembatasan
                atau penutupan akun.
              </p>
            </section>
            <section>
              <h2 className="font-bold text-[#2b2118]">4. Layanan</h2>
              <p className="mt-1">
                kerja.inc menyediakan platform perantara dan tidak menjadi pihak dalam hubungan kerja
                antara talenta dan pemberi kerja. Ketersediaan layanan dapat berubah dengan
                pemberitahuan wajar.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
