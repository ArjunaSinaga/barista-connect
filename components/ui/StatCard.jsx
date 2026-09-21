import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Kartu statistik bersama: varian lingkaran-ikon (talenta) & label-inline (active/pelamar).
// Tanpa onSelect/href: <div> statis seperti sebelumnya. Dengan salah satunya: interaktif penuh (button/link).
export default function StatCard({
  icon: Icon,
  label,
  value,
  sub = null,
  delta = null,
  dark = false,
  chevron = false,
  circled = true,
  valueClass = "text-espresso",
  onSelect = null,
  href = null,
}) {
  if (dark) {
    return (
      <div className="rounded-2xl bg-coffee p-3 text-white">
        <p className="text-[11px] font-bold tracking-widest text-[#f5f1e8]/70 uppercase">{label}</p>
        <p className="mt-1 text-xl font-black tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-[#f5f1e8]/70">{sub}</p>}
      </div>
    );
  }
  const inner = (
    <>
      <p
        className={
          circled
            ? "flex items-center gap-2 text-xs font-bold text-espresso-soft"
            : "flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-espresso-soft uppercase"
        }
      >
        {Icon && circled && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#efe9d9] text-espresso">
            <Icon size={12} aria-hidden="true" />
          </span>
        )}
        {Icon && !circled && <Icon size={12} aria-hidden="true" />}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {(chevron || onSelect || href) && <ChevronRight size={13} aria-hidden="true" className="shrink-0 text-[#b6a98f]" />}
      </p>
      <p className={`mt-1 text-xl font-black tracking-tight tabular-nums ${valueClass}`}>{value}</p>
      {(sub || delta) && (
        <p className="mt-0.5 text-[11px] font-semibold text-matcha">
          {delta ? <span className="mr-1">↑ {delta} ·</span> : null}
          {sub}
        </p>
      )}
    </>
  );
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Lihat ${label}`}
        className="block w-full cursor-pointer rounded-2xl border border-[#e8e0cf] bg-white p-3 text-left shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-coffee"
      >
        {inner}
      </button>
    );
  }
  if (href) {
    return (
      <Link
        href={href}
        aria-label={`Lihat ${label}`}
        className="block rounded-2xl border border-[#e8e0cf] bg-white p-3 shadow-[0_1px_3px_rgba(43,33,24,0.08)] hover:border-coffee"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-white p-3 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      {inner}
    </div>
  );
}
