import Link from "next/link";
import { ShieldCheck, Star, GraduationCap, BarChart3, ChevronRight } from "lucide-react";

// Tiap blok mandiri (kartu putih sendiri). Tanpa DB — statis/STUB kecuali foto.
const ITEMS = [
  { icon: <ShieldCheck size={18} className="text-[#1f6b4a]" />, tint: "bg-[#e3f0e8]", title: "Verified Experience", desc: "Work history verified by cafes" },
  { icon: <Star size={18} className="text-[#8a6d1f]" />, tint: "bg-[#f5ecd4]", title: "Cafe Reviews & Ratings", desc: "Real feedback from employers" },
  { icon: <GraduationCap size={18} className="text-[#1f6b4a]" />, tint: "bg-[#e3f0e8]", title: "Skilled Talent from Training", desc: "Baristas trained and certified by kerja.inc" },
  { icon: <BarChart3 size={18} className="text-[#1f6b4a]" />, tint: "bg-[#e3f0e8]", title: "Attendance & Shift Summary", desc: "Track attendance, shift fulfilment and reliability", badge: "Phase 2" },
];

export function EcosystemCard() {
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:min-h-full">
      <h3 className="text-sm font-extrabold text-[#2b2118]">More than a job board</h3>
      <p className="mt-0.5 text-xs text-[#857768]">A complete coffee hiring ecosystem.</p>
      <ul className="mt-2 space-y-1">
        {ITEMS.map((it) => (
          <li key={it.title} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#faf7ef]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${it.tint}`}>{it.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[13px] font-extrabold text-[#2b2118]">
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

export function AcademyCard({ image }) {
  const src = image ?? `https://picsum.photos/seed/barista-training/640/320`;
  const points = ["Beginner to Advanced", "Learn from Industry Experts", "Get Certified by kerja.inc"];
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:min-h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#2b2118]">kerja.inc Academy</h3>
        <Link href="/signup" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
          View all courses <ChevronRight size={13} />
        </Link>
      </div>
      <div className="mt-2 grid grid-cols-2 items-stretch gap-2">
        <div className="min-w-0">
          <p className="text-[15px] leading-6 font-extrabold text-[#2b2118]">Barista training for a brighter tomorrow.</p>
          <p className="mt-1 text-xs leading-5 text-[#857768]">
            From beginner to advanced, our industry-led courses help baristas build real skills and cafe-ready confidence.
          </p>
          <Link href="/signup" className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#3d2c1e] px-5 text-[13px] font-bold text-white hover:bg-[#2e2015]">
            Explore Courses
          </Link>
        </div>
        <div className="relative min-h-44 overflow-hidden rounded-xl">
          <img src={src} alt="Barista training" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <ul className="absolute top-2 left-2 space-y-1 rounded-lg bg-[#ffffff]/95 p-2 shadow">
            {points.map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-[10px] leading-3 font-semibold text-[#3d2c1e]">
                <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#e3f0e8] text-[9px] font-bold text-[#1f6b4a]">✓</span>{t}
              </li>
            ))}
          </ul>
          <span className="absolute right-2 bottom-2 flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-[#c9a227] text-center text-[8px] leading-tight font-extrabold text-white shadow">
            CERTIFIED BY kerja.inc
          </span>
        </div>
      </div>
    </div>
  );
}

const BARS = [
  { d: "Mon", h: 55 }, { d: "Tue", h: 70 }, { d: "Wed", h: 45 },
  { d: "Thu", h: 60 }, { d: "Fri", h: 82 }, { d: "Sat", h: 65 }, { d: "Sun", h: 75 },
];

export function SmarterOpsCard() {
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-4 shadow-[0_1px_3px_rgba(43,33,24,0.08)] lg:min-h-full">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-[#2b2118]">For Cafe Owners: Smarter Operations</h3>
        <span className="shrink-0 rounded-full bg-[#e3ecf5] px-2 py-0.5 text-[10px] font-bold text-[#2b5f8a]">Coming Soon</span>
      </div>
      <p className="mt-1 text-[15px] leading-6 font-extrabold text-[#2b2118]">See more than just talent. Build a better team.</p>
      <p className="mt-1 text-xs leading-5 text-[#857768]">
        Track attendance, shift fulfilment, reliability scores and more. Make data-driven decisions and run a smoother, stronger cafe.
      </p>
      <div className="mt-3 rounded-xl bg-[#faf7ef] p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-[#2b2118]">Team Overview (Phase 2)</p>
          <span className="rounded-md border border-[#e0d5bd] bg-[#ffffff] px-2 py-0.5 text-[10px] font-bold text-[#857768]">This Month</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            ["92%", "Shift Fulfilment", "↑ 12%"],
            ["4.7", "Team Reliability", "↑ 0.4"],
            ["28", "Shifts Completed", "↑ 27%"],
          ].map(([v, l, d]) => (
            <div key={l} className="rounded-lg bg-[#ffffff] px-1 py-2">
              <p className="text-sm font-extrabold text-[#2b2118]">{v}</p>
              <p className="text-[9px] leading-tight text-[#857768]">{l}</p>
              <p className="text-[9px] font-bold text-[#1f6b4a]">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex h-20 items-end justify-between gap-1.5 px-1">
          {BARS.map((b) => (
            <div key={b.d} className="flex flex-1 flex-col items-center justify-end gap-1">
              <div className="flex w-full flex-col justify-end gap-0.5" style={{ height: `${b.h}%` }}>
                <div className="w-full rounded-sm bg-[#1f6b4a]" style={{ height: "72%" }} />
                <div className="w-full rounded-sm bg-[#d8cdae]" style={{ height: "28%" }} />
              </div>
              <span className="text-[8px] font-bold text-[#b6a98f]">{b.d}</span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-3 text-[9px] font-bold text-[#857768]">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#1f6b4a]" />Completed</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#d8cdae]" />Missed</span>
        </div>
      </div>
      <Link href="/signup" className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#d8cdae] px-5 text-[13px] font-bold text-[#3d2c1e] hover:border-[#3d2c1e]">
        Join the Waitlist
      </Link>
    </div>
  );
}
