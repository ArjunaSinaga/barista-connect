import Link from "next/link";
import { ShieldCheck, Star, GraduationCap, BarChart3, ChevronRight } from "lucide-react";

// Tiap blok mandiri (kartu putih sendiri). Tanpa DB — statis/STUB.
const ITEMS = [
  { icon: <ShieldCheck size={18} className="text-[#1f6b4a]" />, tint: "bg-[#e3f0e8]", title: "Verified Experience", desc: "Work history verified by cafes" },
  { icon: <Star size={18} className="text-[#8a6d1f]" />, tint: "bg-[#f5ecd4]", title: "Cafe Reviews & Ratings", desc: "Real feedback from employers" },
  { icon: <GraduationCap size={18} className="text-[#1f6b4a]" />, tint: "bg-[#e3f0e8]", title: "Skilled Talent from Training", desc: "Baristas trained and certified by kerja.inc" },
  { icon: <BarChart3 size={18} className="text-[#1f6b4a]" />, tint: "bg-[#e3f0e8]", title: "Attendance & Shift Summary", desc: "Track attendance, shift fulfilment and reliability", badge: "Phase 2" },
];

export function EcosystemCard() {
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <h3 className="text-sm font-bold text-[#2b2118]">More than a job board</h3>
      <p className="mt-0.5 text-xs text-[#857768]">A complete coffee hiring ecosystem.</p>
      <ul className="mt-2 space-y-1">
        {ITEMS.map((it) => (
          <li key={it.title} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#faf7ef]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${it.tint}`}>{it.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[13px] font-bold text-[#2b2118]">
                <span className="truncate">{it.title}</span>
                {it.badge && (
                  <span className="shrink-0 rounded-full bg-[#e3ecf5] px-2 py-0.5 text-[10px] font-bold text-[#2b5f8a]">{it.badge}</span>
                )}
              </span>
              <span className="block truncate text-[11px] text-[#857768]">{it.desc}</span>
            </span>
            <ChevronRight size={15} className="shrink-0 text-[#b6a98f]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AcademyCard() {
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2b2118]">kerja.inc Academy</h3>
        <Link href="/signup" className="inline-flex items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
          View all courses <ChevronRight size={13} />
        </Link>
      </div>
      <p className="mt-2 text-[15px] leading-6 font-bold text-[#2b2118]">Barista training for a brighter tomorrow.</p>
      <p className="mt-1 text-xs leading-5 text-[#857768]">
        From beginner to advanced, our industry-led courses help baristas build real skills and cafe-ready confidence.
      </p>
      <ul className="mt-2 space-y-1 text-xs text-[#857768]">
        {["Beginner to Advanced", "Learn from Industry Experts", "Get Certified by kerja.inc"].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e3f0e8] text-[10px] font-bold text-[#1f6b4a]">✓</span>{t}
          </li>
        ))}
      </ul>
      <Link href="/signup" className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#3d2c1e] px-5 text-[13px] font-bold text-white hover:bg-[#2e2015]">
        Explore Courses
      </Link>
    </div>
  );
}

export function SmarterOpsCard() {
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#2b2118]">For Cafe Owners: Smarter Operations</h3>
        <span className="shrink-0 rounded-full bg-[#e3ecf5] px-2 py-0.5 text-[10px] font-bold text-[#2b5f8a]">Coming Soon</span>
      </div>
      <p className="mt-1 text-xs leading-5 text-[#857768]">
        See more than just talent. Build a better team — attendance, reliability scores and shift fulfilment in one place.
      </p>
      <Link href="/signup" className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#d8cdae] px-5 text-[13px] font-bold text-[#3d2c1e] hover:border-[#3d2c1e]">
        Join the Waitlist
      </Link>
    </div>
  );
}
