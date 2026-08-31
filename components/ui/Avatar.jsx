import Image from "next/image";

const SIZES = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
};

export default function Avatar({ src, name = "", size = "md", className = "" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-cream-dark ${SIZES[size]} ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "Avatar"}
          fill
          sizes="112px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-extrabold text-caramel">
          {initials || "?"}
        </span>
      )}
    </div>
  );
}
