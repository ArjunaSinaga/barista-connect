import Link from "next/link";

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-latte bg-white/60 px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cream-dark text-caramel">
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
          className="mt-5 inline-flex rounded-xl bg-caramel px-5 py-2.5 text-sm font-semibold text-white hover:bg-caramel-dark"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
