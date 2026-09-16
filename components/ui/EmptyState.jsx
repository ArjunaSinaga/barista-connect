import Link from "next/link";

export function EmptyState({ icon, title, subtitle, actionLabel, actionHref, compact }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-latte bg-[#faf7ef] text-center ${compact ? "px-6 py-6" : "px-6 py-16"}`}>
      {icon && (
        <div className={`flex items-center justify-center rounded-full bg-cream-dark text-caramel ${compact ? "mb-2 h-10 w-10" : "mb-4 h-14 w-14"}`}>
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-espresso">{title}</h3>
      {subtitle && (
        <p className="mt-1 max-w-sm text-sm text-espresso-soft">{subtitle}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={`inline-flex rounded-xl bg-caramel px-5 py-2.5 text-sm font-semibold text-white hover:bg-caramel-dark ${compact ? "mt-3" : "mt-5"}`}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
export default EmptyState;
