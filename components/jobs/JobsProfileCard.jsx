import Link from "next/link";
import { Briefcase, Bookmark, FileText, Bell, BookOpen, Store } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

// Kolom kiri board: kartu profil barista + nav (Jobs aktif, Applied real).
// Saved/Alerts menyusul di F3b — tidak dirender agar tidak ada link mati.
export default function JobsProfileCard({ barista, appliedCount, savedCount = 0, isOwner = false }) {
  if (isOwner) {
    return (
      <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-5 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="text-sm font-extrabold text-[#2b2118]">Manage your cafes&apos; jobs from the owner dashboard.</p>
        <Link
          href="/dashboard/owner"
          className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-full bg-[#3d2c1e] px-5 text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Open Dashboard
        </Link>
      </div>
    );
  }
  if (!barista) {
    return (
      <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-5 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="text-sm font-extrabold text-[#2b2118]">Great coffee starts with great people.</p>
        <p className="mx-auto mt-1 max-w-55 text-xs leading-5 text-[#857768]">
          Log in to apply, save jobs, and build your reputation.
        </p>
        <Link
          href="/login?next=/jobs"
          className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-full bg-[#3d2c1e] px-5 text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Find Your Next Opportunity
        </Link>
      </div>
    );
  }

  const row = (active) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold ${
      active ? "bg-[#efe9d9] text-[#3d2c1e]" : "text-[#6f6252] hover:bg-[#faf7ef] hover:text-[#3d2c1e]"
    }`;

  return (
    <div className="min-w-0 space-y-3">
      <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-5 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <Avatar src={barista.profile_picture_url} name={barista.full_name} size="lg" className="mx-auto" />
        <p className="mt-2 truncate text-base font-extrabold tracking-tight text-[#2b2118]">{barista.full_name}</p>
        <p className="mt-0.5 text-xs text-[#857768]">Barista • Coffee Enthusiast</p>
        <p className="mt-0.5 truncate text-xs text-[#857768]">{barista.location_place ?? "-"}</p>
        <div className="mt-3 flex items-stretch justify-center gap-4 text-center">
          <div>
            <p className="text-sm font-extrabold text-[#2b2118] tabular-nums">{barista.years_of_experience ?? 0}</p>
            <p className="text-[10px] text-[#857768]">Years Exp.</p>
          </div>
          <div className="border-l border-[#e8e0cf] pl-4">
            <p className="text-sm font-extrabold text-[#2b2118] tabular-nums">{barista.skills?.length ?? 0}</p>
            <p className="text-[10px] text-[#857768]">Skills</p>
          </div>
          <div className="border-l border-[#e8e0cf] pl-4">
            <p className="text-sm font-extrabold text-[#2b2118] tabular-nums">{appliedCount}</p>
            <p className="text-[10px] text-[#857768]">Applied</p>
          </div>
        </div>
        <Link
          href="/dashboard/barista/profile"
          className="mt-3 block rounded-full bg-[#efe9d9] px-4 py-2 text-center text-xs font-bold text-[#3d2c1e] hover:bg-[#e5dcc4]"
        >
          View Profile
        </Link>
      </div>

      <nav aria-label="Jobs" className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-2 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <Link href="/jobs" className={row(true)}>
          <Briefcase size={17} className="shrink-0" />
          <span className="flex-1 text-left">Jobs</span>
        </Link>
        <Link href="/jobs?saved=1" className={row(false)}>
          <Bookmark size={17} className="shrink-0" />
          <span className="flex-1 text-left">Saved Jobs</span>
          <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-[#6f6252]">{savedCount}</span>
        </Link>
        <Link href="/dashboard/barista/applications" className={row(false)}>
          <FileText size={17} className="shrink-0" />
          <span className="flex-1 text-left">Applied Jobs</span>
          <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-[#6f6252]">{appliedCount}</span>
        </Link>
        <Link href="/messages" className={row(false)}>
          <Bell size={17} className="shrink-0" />
          <span className="flex-1 text-left">Messages</span>
        </Link>
        <Link href="/training" className={row(false)}>
          <BookOpen size={17} className="shrink-0" />
          <span className="flex-1 text-left">Career Resources</span>
        </Link>
      </nav>

      <div className="overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#2b1c11] p-5 text-white shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="text-base leading-6 font-extrabold">Great coffee starts with great people.</p>
        <Link
          href="/training"
          className="mt-3 inline-flex min-h-[36px] items-center justify-center rounded-full bg-[#f5f1e8] px-4 text-xs font-bold text-[#2b1c11] hover:bg-white"
        >
          <Store size={13} className="mr-1.5" /> Grow Your Skills
        </Link>
      </div>
    </div>
  );
}
