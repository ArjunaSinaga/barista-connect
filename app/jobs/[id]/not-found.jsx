import Link from "next/link";
import { SearchX } from "lucide-react";

// JOBDET-33: loker tak ada / sudah dihapus owner — pesan berguna + rute ke /jobs.
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#faf6ec] text-espresso-soft">
        <SearchX size={22} />
      </span>
      <h1 className="mt-4 text-lg font-extrabold text-espresso">Lowongan tidak ditemukan</h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Loker ini mungkin sudah dihapus atau ditutup pemilik usaha. Coba jelajahi lowongan lain yang masih buka.
      </p>
      <Link
        href="/jobs"
        className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-coffee px-6 text-sm font-bold text-white hover:bg-[#2e2015]"
      >
        Lihat Semua Lowongan
      </Link>
    </div>
  );
}
