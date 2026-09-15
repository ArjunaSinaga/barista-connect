"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Users, Star, GraduationCap, Settings,
  Camera, Crown, ArrowRight,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";

// Sidebar dashboard owner ala mockup: kartu profil cafe + nav + upsell Pro.
// Semua angka dari props (data real), bukan hardcode.
export default function SidebarOwner({ cafe, ownerName, completeness, counts }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const photo = cafe?.photo_urls?.[0] ?? null;
  const name = cafe?.name ?? ownerName ?? "Cafe Anda";
  const loc = cafe?.address ?? cafe?.location ?? "Lengkapi alamat cafe";

  const NAV = [
    { href: "/dashboard/owner", label: "Dashboard", icon: LayoutDashboard, active: pathname === "/dashboard/owner" && !tab, count: null },
    { href: "/dashboard/owner?tab=lowongan", label: "Active Jobs", icon: Briefcase, active: tab === "lowongan", count: counts.activeJobs },
    { href: "/dashboard/owner?tab=lowongan", label: "Pelamar", icon: Users, active: false, count: counts.applicants },
    { href: "/dashboard/owner/team", label: "Reviews Given", icon: Star, active: pathname?.startsWith("/dashboard/owner/team"), count: counts.reviewsGiven },
    { href: "/dashboard/owner/cafes", label: "Cafe Saya", icon: Camera, active: pathname?.startsWith("/dashboard/owner/cafes"), count: counts.cafes },
    { href: "/dashboard/owner/profile", label: "Settings", icon: Settings, active: pathname?.startsWith("/dashboard/owner/profile"), count: null },
  ];

  return (
    <aside className="min-w-0 space-y-4">
      <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-5 text-center shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <div className="relative mx-auto h-28 w-28">
          {photo ? (
            <img src={photo} alt={name} className="h-28 w-28 rounded-full border-4 border-[#efe9d9] object-cover" />
          ) : (
            <Avatar name={name} size="lg" />
          )}
          <Link
            href="/dashboard/owner/cafes"
            aria-label="Edit foto cafe"
            className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#e0d5bd] bg-[#ffffff] text-[#6f6252] hover:text-[#3d2c1e]"
          >
            <Camera size={14} />
          </Link>
        </div>
        <p className="mt-3 text-lg font-extrabold tracking-tight text-[#2b2118]">{name}</p>
        <p className="mt-0.5 text-xs text-[#857768]">{loc}</p>
        <div className="mt-4 text-left">
          <p className="flex items-center justify-between text-xs font-bold text-[#2b2118]">
            Profil Bisnis <span>{completeness}%</span>
          </p>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#efe9d9]">
            <div className="h-full rounded-full bg-[#1f6b4a]" style={{ width: `${completeness}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-[#857768]">Lengkapi profil untuk menjangkau talenta terbaik.</p>
          <Link
            href="/dashboard/owner/profile"
            className="mt-2 block rounded-full bg-[#efe9d9] px-4 py-2 text-center text-xs font-bold text-[#3d2c1e] hover:bg-[#e5dcc4]"
          >
            Edit Profil
          </Link>
        </div>
      </div>

      <nav className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-2 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        {NAV.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold ${
              n.active ? "bg-[#efe9d9] text-[#3d2c1e]" : "text-[#6f6252] hover:bg-[#faf7ef] hover:text-[#3d2c1e]"
            }`}
          >
            <n.icon size={17} className="shrink-0" />
            <span className="flex-1">{n.label}</span>
            {n.count !== null && n.count !== undefined && (
              <span className="rounded-full bg-[#efe9d9] px-2 py-0.5 text-[11px] font-bold text-[#6f6252]">{n.count}</span>
            )}
          </Link>
        ))}
        <span
          title="Segera hadir"
          className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[#6f6252]/50"
        >
          <GraduationCap size={17} className="shrink-0" />
          <span className="flex-1">Training</span>
        </span>
      </nav>

      <div className="rounded-2xl border border-[#e8e0cf] bg-[#efe9d9] p-5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <p className="flex items-center gap-2 text-sm font-extrabold text-[#3d2c1e]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3d2c1e] text-white"><Crown size={15} /></span>
          kerja.inc Pro
        </p>
        <p className="mt-2 text-xs leading-5 text-[#6f6252]">
          Upgrade ke Pro untuk akses talenta prioritas, insight lebih dalam, dan fitur eksklusif.
        </p>
        <Link
          href="/verify"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#3d2c1e] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e2015]"
        >
          Upgrade Sekarang <ArrowRight size={13} />
        </Link>
      </div>
    </aside>
  );
}
