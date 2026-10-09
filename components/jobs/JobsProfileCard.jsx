import Link from "next/link";
import { Briefcase, Bookmark, FileText, Bell, BookOpen, Sparkles, Award } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { formatExpShort } from "@/lib/exp";

// Kolom kiri board: kartu profil barista + nav (Jobs aktif, Applied real).
// Saved/Alerts menyusul di F3b — tidak dirender agar tidak ada link mati.
export default function JobsProfileCard({ barista, appliedCount, savedCount = 0, isOwner = false, unreadCount = 0 }) {
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

  // H-08: skor kelengkapan dari data profil asli (foto, lokasi, pengalaman, skill, CV, cover letter).
  const compItems = [
    !!barista.full_name,
    !!barista.profile_picture_url,
    !!barista.location_place,
    (barista.experience_months ?? 0) > 0 || (barista.years_of_experience ?? 0) > 0,
    (barista.skills?.length ?? 0) > 0,
    !!barista.cv_url,
  ];
  const completeness = Math.round((compItems.filter(Boolean).length / compItems.length) * 100);

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
          <span className="flex-1 text-left">Cari Kerja</span>
        </Link>
        <Link href="/jobs?reco=1" className={row(false)}>
          <Sparkles size={17} className="shrink-0" />
          <span className="flex-1 text-left">Rekomendasi</span>
        </Link>
        <Link href="/dashboard/barista/applications" className={row(false)}>
          <FileText size={17} className="shrink-0" />
          <span className="flex-1 text-left">Lamaran Saya</span>
          <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-espresso-soft">{appliedCount}</span>
        </Link>
        <Link href="/jobs?saved=1" className={row(false)}>
          <Bookmark size={17} className="shrink-0" />
          <span className="flex-1 text-left">Pekerjaan Disimpan</span>
          <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-espresso-soft">{savedCount}</span>
        </Link>
        <Link href="/dashboard/barista/notifikasi" className={row(false)}>
          <Bell size={17} className="shrink-0" />
          <span className="flex-1 text-left">Notifikasi</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">{unreadCount}</span>
          )}
        </Link>
        <p className="px-3 pt-2 pb-1 text-[10px] font-extrabold tracking-wide text-[#b6a98f] uppercase">Pengembangan Diri</p>
        <Link href="/training" className={row(false)}>
          <BookOpen size={17} className="shrink-0" />
          <span className="flex-1 text-left">Kerja.inc Academy</span>
        </Link>
        <Link href="/verify-cert" className={row(false)}>
          <Award size={17} className="shrink-0" />
          <span className="flex-1 text-left">Sertifikat Saya</span>
        </Link>
      </nav>

      <div className="rounded-2xl border border-[#e8e0cf] bg-[#faf7ef] p-5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="text-sm leading-6 font-extrabold text-espresso">Lengkapi profil untuk lebih banyak rekomendasi kerja</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8e0cf]">
          <div className="h-full rounded-full bg-[#4a7c59]" style={{ width: `${completeness}%` }} />
        </div>
        <p className="mt-1 text-right text-[11px] font-bold text-[#4a7c59] tabular-nums">{completeness}%</p>
        <Link
          href="/dashboard/barista/profile"
          className="mt-2 block rounded-full bg-coffee px-4 py-2 text-center text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Lihat Profil
        </Link>
      </div>

    </div>
  );
}
