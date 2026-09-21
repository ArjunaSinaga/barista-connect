import Link from "next/link";

// Deret pills filter cepat bersama: items [{ label, href, icon: Component | "dot" }].
export default function FilterPills({ items, prefix = "Filter Cepat:" }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-bold text-espresso-soft">{prefix}</span>
      {items.map((f) => (
        <Link
          key={f.label}
          href={f.href}
          className="inline-flex items-center gap-1 rounded-full border border-[#e0d5bd] bg-white px-2.5 py-0.5 text-[11px] font-bold text-espresso-soft hover:border-coffee hover:text-espresso"
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
