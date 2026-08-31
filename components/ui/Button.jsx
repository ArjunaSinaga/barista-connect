"use client";

import Link from "next/link";

const VARIANTS = {
  primary:
    "bg-caramel text-white hover:bg-caramel-dark shadow-sm disabled:bg-caramel/50",
  secondary:
    "bg-white text-espresso border border-latte hover:border-caramel hover:text-caramel",
  ghost: "text-espresso-soft hover:text-caramel hover:bg-cream-dark",
  danger: "bg-red-500 text-white hover:bg-red-600",
  success: "bg-matcha text-white hover:brightness-95",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  href,
  variant = "primary",
  size = "md",
  full,
  className = "",
  children,
  ...props
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-all active:scale-[0.95] cursor-pointer disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${full ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
