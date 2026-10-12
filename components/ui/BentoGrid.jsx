export function BentoGrid({ className = "", children }) {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>
      {children}
    </div>
  );
}

export function BentoGridItem({ className = "", header, title, description, href, linkLabel }) {
  return (
    <div
      className={
        "fx-spotlight group flex flex-col overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-[0_1px_3px_rgba(43,33,24,0.08)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(43,33,24,0.12)] active:scale-[0.99] " +
        className
      }
    >
      {header && <div className="relative min-h-32 overflow-hidden">{header}</div>}
      <div className="flex flex-1 flex-col p-4">
        {title && <p className="text-sm font-bold">{title}</p>}
        {description && (
          <div className="mt-0.5 text-xs leading-5 text-espresso-soft">{description}</div>
        )}
        {href && linkLabel && (
          <a
            href={href}
            className="fx-underline mt-2 inline-flex w-fit items-center gap-0.5 text-xs font-bold text-link"
          >
            {linkLabel} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </div>
  );
}
