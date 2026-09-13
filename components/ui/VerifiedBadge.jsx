import { BadgeCheck } from "lucide-react";

export default function VerifiedBadge({ size = 16, className = "" }) {
  return (
    <span className={`inline-flex items-center ${className}`} title="Terverifikasi" aria-label="Terverifikasi">
      <BadgeCheck size={size} className="shrink-0 text-sky-500" fill="currentColor" stroke="#fff" strokeWidth={1.5} />
    </span>
  );
}
