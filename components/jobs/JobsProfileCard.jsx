import Link from "next/link";
import { Briefcase, Bookmark, FileText, Bell, BookOpen, Store } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { formatExpShort } from "@/lib/exp";

// Kolom kiri board: kartu profil barista + nav (Jobs aktif, Applied real).
// Saved/Alerts menyusul di F3b — tidak dirender agar tidak ada link mati.
export default function JobsProfileCard({ barista, appliedCount, savedCount = 0, isOwner = false }) {
  if (isOwner) {
    return (
      <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="text-sm font-extrabold text-espresso">Kelola loker kafemu dari dashboard owner.</p>
        <Link
          href="/dashboard/owner"
          className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Buka Dashboard
        </Link>
      </div>
    );
  }
  if (!barista) {
    return (
      <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="text-sm font-extrabold text-espresso">Kopi enak berawal dari orang hebat.</p>
        <p className="mx-auto mt-1 max-w-55 text-xs leading-5 text-espresso-soft">
          Masuk untuk melamar, menyimpan loker, dan membangun reputasimu.
        </p>
        <Link
          href="/login?next=/jobs"
          className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Cari Peluangmu
        </Link>
      </div>
    );
  }

  const row = (active) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold ${
      active ? "bg-[#efe9d9] text-espresso" : "text-espresso-soft hover:bg-[#faf7ef] hover:text-espresso"
    }`;

  return (
    <div className="min-w-0 space-y-3">
      <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <Avatar src={barista.profile_picture_url} name={barista.full_name} size="lg" className="mx-auto" />
        <p className="mt-2 truncate text-base font-extrabold tracking-tight text-espresso">{barista.full_name}</p>
        <p className="mt-0.5 text-xs text-espresso-soft">Barista • Pecinta Kopi</p>
        <p className="mt-0.5 truncate text-xs text-espresso-soft">{barista.location_place ?? "-"}</p>
        <div className="mt-3 flex items-stretch justify-center gap-4 text-center">
          <div>
            <p className="text-sm font-extrabold text-espresso tabular-nums">{formatExpShort(barista.experience_months, barista.years_of_experience)}</p>
            <p className="text-[10px] text-espresso-soft">Pengalaman</p>
          </div>
          <div className="border-l border-[#e8e0cf] pl-4">
            <p className="text-sm font-extrabold text-espresso tabular-nums">{barista.skills?.length ?? 0}</p>
            <p className="text-[10px] text-espresso-soft">Skill</p>
          </div>
          <div className="border-l border-[#e8e0cf] pl-4">
            <p className="text-sm font-extrabold text-espresso tabular-nums">{appliedCount}</p>
            <p className="text-[10px] text-espresso-soft">Dilamar</p>
          </div>
        </div>
        <Link
          href="/dashboard/barista/profile"
          className="mt-3 block rounded-full bg-[#efe9d9] px-4 py-2 text-center text-xs font-bold text-espresso hover:bg-[#e5dcc4]"
        >
          Lihat Profil
        </Link>
      </div>

      <nav aria-label="Loker" className="rounded-2xl border border-[#e8e0cf] bg-white p-2 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <Link href="/jobs" className={row(true)}>
          <Briefcase size={17} className="shrink-0" />
          <span className="flex-1 text-left">Loker</span>
        </Link>
        <Link href="/jobs?saved=1" className={row(false)}>
          <Bookmark size={17} className="shrink-0" />
          <span className="flex-1 text-left">Loker Tersimpan</span>
          <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-espresso-soft">{savedCount}</span>
        </Link>
        <Link href="/dashboard/barista/applications" className={row(false)}>
          <FileText size={17} className="shrink-0" />
          <span className="flex-1 text-left">Lamaran Saya</span>
          <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-espresso-soft">{appliedCount}</span>
        </Link>
        <Link href="/messages" className={row(false)}>
          <Bell size={17} className="shrink-0" />
          <span className="flex-1 text-left">Pesan</span>
        </Link>
        <Link href="/training" className={row(false)}>
          <BookOpen size={17} className="shrink-0" />
          <span className="flex-1 text-left">Belajar</span>
        </Link>
      </nav>

      <div className="overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#2b1c11] p-5 text-white shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="text-base leading-6 font-extrabold">Kopi enak berawal dari orang hebat.</p>
        <Link
          href="/training"
          className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-full bg-paper px-4 text-xs font-bold text-[#2b1c11] hover:bg-white"
        >
          <Store size={13} className="mr-1.5" /> Asah Skillmu
        </Link>
      </div>
    </div>
  );
}
