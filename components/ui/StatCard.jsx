import { ChevronRight } from "lucide-react";

// Kartu statistik bersama: varian lingkaran-ikon (talenta) & label-inline (active/pelamar).
export default function StatCard({
  icon: Icon,
  label,
  value,
  sub = null,
  delta = null,
  dark = false,
  chevron = false,
  circled = true,
  valueClass = "text-[#2b2118]",
}) {
  if (dark) {
    return (
      <div className="rounded-2xl bg-[#3d2c1e] p-3 text-white">
        <p className="text-[11px] font-bold tracking-widest text-[#f5f1e8]/70 uppercase">{label}</p>
        <p className="mt-1 text-xl font-black tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-[#f5f1e8]/70">{sub}</p>}
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-3 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <p
        className={
          circled
            ? "flex items-center gap-2 text-xs font-bold text-[#6f6252]"
            : "flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#857768] uppercase"
        }
      >
        {Icon && circled && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#efe9d9] text-[#3d2c1e]">
            <Icon size={12} aria-hidden="true" />
          </span>
        )}
        {Icon && !circled && <Icon size={12} aria-hidden="true" />}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {chevron && <ChevronRight size={13} aria-hidden="true" className="shrink-0 text-[#b6a98f]" />}
      </p>
      <p className={`mt-1 text-xl font-black tracking-tight tabular-nums ${valueClass}`}>{value}</p>
      {(sub || delta) && (
        <p className="mt-0.5 text-[11px] font-semibold text-[#1f6b4a]">
          {delta ? <span className="mr-1">↑ {delta} ·</span> : null}
          {sub}
        </p>
      )}
    </div>
  );
}
