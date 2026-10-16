import Link from "next/link";
import { Mail, KeyRound, UserPlus, CircleHelp } from "lucide-react";

export const metadata = { title: "Pusat Bantuan" };

const FAQS = [
  {
    q: "Saya lupa password. Bagaimana cara masuk lagi?",
    a: "Buka halaman Lupa Password, masukkan alamat email akunmu, lalu klik link reset yang dikirim ke email. Link hanya berlaku terbatas — bila kedaluwarsa, minta link baru.",
  },
  {
    q: "Email verifikasi tidak masuk. Apa yang harus dilakukan?",
    a: "Periksa folder spam/promosi, pastikan alamat email benar, lalu gunakan tombol kirim ulang tautan di halaman Cek Email. Tunggu beberapa menit sebelum meminta ulang agar tidak kena batas kirim.",
  },
  {
    q: "Bagaimana cara kirim ulang link verifikasi?",
    a: "Kembali ke halaman Cek Email setelah mendaftar, tekan kirim ulang, lalu buka tautan terbaru dari email. Tautan lama otomatis tidak berlaku setelah tautan baru diminta.",
  },
  {
    q: "Akun saya perannya salah (barista/owner). Bisa diubah?",
    a: "Peran ditentukan saat pendaftaran. Bila salah pilih, daftar dengan alamat email berbeda atau hubungi support agar dibantu penyesuaiannya.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.18em] text-espresso-soft uppercase">
        Pusat Bantuan
      </p>
      <h1 className="mt-1 font-serif text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
        Butuh bantuan akun?
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-espresso-soft">
        Jawaban cepat untuk masalah akun yang paling sering terjadi: lupa
        password, verifikasi email, dan kirim ulang tautan.
      </p>

      <div className="mt-6 rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-espresso">
          <CircleHelp size={20} className="text-caramel" /> Pertanyaan umum
        </h2>
        <div className="mt-4 space-y-3">
          {FAQS.map((f) => (
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
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-espresso">
            <KeyRound size={18} className="text-caramel" /> Lupa password
          </h2>
          <p className="mt-1 text-sm text-espresso-soft">
            Minta tautan reset baru lewat halaman khusus.
          </p>
          <Link
            href="/forgot-password"
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full bg-coffee px-5 text-sm font-bold text-white hover:bg-[#2e2015]"
          >
            Ke halaman Lupa Password
          </Link>
        </div>
        <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-espresso">
            <UserPlus size={18} className="text-caramel" /> Belum punya akun
          </h2>
          <p className="mt-1 text-sm text-espresso-soft">
            Daftar gratis sebagai barista atau owner kafe.
          </p>
          <Link
            href="/signup"
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full bg-coffee px-5 text-sm font-bold text-white hover:bg-[#2e2015]"
          >
            Daftar sekarang
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-espresso">
          <Mail size={18} className="text-caramel" /> Hubungi support
        </h2>
        <p className="mt-1 text-sm leading-6 text-espresso-soft">
          Sudah coba langkah di atas tapi masih buntu? Kirim email dengan
          subjek jelas (mis. &quot;Gagal reset password&quot;) beserta alamat
          email akunmu agar cepat dibantu.
        </p>
        <a
          href="mailto:support@kerja.inc"
          className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full border border-coffee px-5 text-sm font-bold text-coffee"
        >
          support@kerja.inc
        </a>
      </div>
    </div>
  );
}
