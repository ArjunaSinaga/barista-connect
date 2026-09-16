import Link from "next/link";

// Deret pills filter cepat bersama: items [{ label, href, icon: Component | "dot" }].
export default function FilterPills({ items, prefix = "Filter Cepat:" }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-bold text-[#857768]">{prefix}</span>
      {items.map((f) => (
        <Link
          key={f.label}
          href={f.href}
          className="inline-flex items-center gap-1 rounded-full border border-[#e0d5bd] bg-[#ffffff] px-2.5 py-0.5 text-[11px] font-bold text-[#6f6252] hover:border-[#3d2c1e] hover:text-[#3d2c1e]"
        >
          {f.icon === "dot" ? (
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1f6b4a]" />
          ) : f.icon ? (
            <f.icon size={11} aria-hidden="true" />
          ) : null}
          {f.short ? (
            <span className="max-w-28 truncate">{f.label}</span>
          ) : (
            f.label
          )}
        </Link>
      ))}
    </div>
  );
}
