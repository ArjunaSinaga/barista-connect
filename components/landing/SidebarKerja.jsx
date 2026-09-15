import Link from "next/link";
import { ShieldCheck, Star, GraduationCap, BarChart3, ArrowRight } from "lucide-react";

// Right-rail marketing column (kerja.inc style). All static/STUB — no DB behind these yet.
const ITEMS = [
  { icon: <ShieldCheck size={20} className="text-[#6f5a3e]" />, title: "Verified Experience", desc: "Work history verified by cafes" },
  { icon: <Star size={20} className="text-[#6f5a3e]" />, title: "Cafe Reviews & Ratings", desc: "Real feedback from employers" },
  { icon: <GraduationCap size={20} className="text-[#6f5a3e]" />, title: "Skilled Talent from Training", desc: "Baristas trained and certified by kerja.inc" },
  { icon: <BarChart3 size={20} className="text-[#6f5a3e]" />, title: "Attendance & Shift Summary", desc: "Track attendance, shift fulfilment and reliability", badge: "Phase 2" },
];

export default function SidebarKerja() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#2f2721]/12 bg-[#bdb29b] p-5 shadow-[0_2px_10px_rgba(26,15,10,0.06)]">
        <h3 className="text-[15px] font-bold tracking-tight">More than a job board</h3>
        <p className="mt-1 text-xs leading-5 text-[#2f2721]/60">A complete coffee hiring ecosystem.</p>
        <ul className="mt-4 space-y-2">
          {ITEMS.map((it) => (
            <li key={it.title} className="flex items-center gap-3 rounded-xl bg-[#ece5d3] px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2f2721]/10">{it.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[13px] font-bold">
                  {it.title}
                  {it.badge && (
                    <span className="rounded-full bg-[#1e3932]/10 px-2 py-0.5 text-[10px] font-bold text-[#1e3932]">{it.badge}</span>
                  )}
                </span>
                <span className="block truncate text-[11px] text-[#2f2721]/60">{it.desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#2f2721]/12 bg-[#bdb29b] p-5 shadow-[0_2px_10px_rgba(26,15,10,0.06)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold tracking-tight">kerja.inc Academy</h3>
          <span className="rounded-full bg-[#1e3932]/10 px-2 py-0.5 text-[10px] font-bold text-[#1e3932]">Coming soon</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-[#2f2721]/60">
          Barista training for a brighter tomorrow. From beginner to advanced — courses are on the way.
        </p>
        <Link href="/signup" className="font-chalk mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-lg text-[#6f5a3e] hover:underline">
          Get notified <ArrowRight size={16} />
        </Link>
      </div>

      <div className="rounded-2xl border border-[#2f2721]/12 bg-[#bdb29b] p-5 shadow-[0_2px_10px_rgba(26,15,10,0.06)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold tracking-tight">For Cafe Owners: Smarter Operations</h3>
          <span className="rounded-full bg-[#1e3932]/10 px-2 py-0.5 text-[10px] font-bold text-[#1e3932]">Coming soon</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-[#2f2721]/60">
          See more than just talent. Build a better team — attendance, reliability scores and shift fulfilment in one place.
        </p>
        <Link href="/signup" className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-[#2f2721]/20 px-6 text-sm font-bold hover:border-[#6f5a3e] hover:text-[#6f5a3e]">
          Join the Waitlist
        </Link>
      </div>
    </div>
  );
}
