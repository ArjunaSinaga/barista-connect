import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi — kerja.inc",
  description: "Kebijakan privasi dan pengelolaan data platform kerja.inc.",
};

// REG-12: dibuka dari checkbox pendaftaran di tab baru agar state form utuh.
export default function PrivacyPage() {
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
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2b2118]">Kebijakan Privasi</h1>
          <p className="mt-1 text-sm text-[#2f2721]/60">Terakhir diperbarui: Oktober 2026</p>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#2f2721]/85">
            <section>
              <h2 className="font-bold text-[#2b2118]">1. Data yang kami kumpulkan</h2>
              <p className="mt-1">
                Email, password terenkripsi, peran, serta profil yang Anda lengkapi (nama, kontak,
                pengalaman, data usaha). Data verifikasi identitas disimpan selama akun aktif.
              </p>
            </section>
            <section>
              <h2 className="font-bold text-[#2b2118]">2. Penggunaan data</h2>
              <p className="mt-1">
                Data dipakai untuk autentikasi, pencocokan loker-talenta, verifikasi, dan keamanan
                platform. Kami tidak menjual data pribadi Anda.
              </p>
            </section>
            <section>
              <h2 className="font-bold text-[#2b2118]">3. Hak Anda</h2>
              <p className="mt-1">
                Anda dapat melihat, memperbaiki, dan meminta penghapusan data melalui pengaturan akun
                atau menghubungi tim kami. Waktu dan versi persetujuan Anda tercatat saat mendaftar.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
