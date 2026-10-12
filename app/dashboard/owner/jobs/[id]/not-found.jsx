import Link from "next/link";
import { SearchX } from "lucide-react";

// Paritas barista (app/jobs/[id]/not-found.jsx): lowongan tak ada / di luar kuasa.
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#faf6ec] text-espresso-soft">
        <SearchX size={22} />
      </span>
      <h1 className="mt-4 text-lg font-extrabold text-espresso">Lowongan tidak ditemukan</h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Loker ini mungkin sudah dihapus atau di luar kafe yang kamu kelola. Cek daftar lowongan di dashboard.
      </p>
      <Link
        href="/dashboard/owner?tab=active"
        className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-coffee px-6 text-sm font-bold text-white hover:bg-[#2e2015]"
      >
        Ke Daftar Lowongan
      </Link>
    </div>
  );
}
