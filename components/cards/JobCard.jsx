import Link from "next/link";
import { MapPin, Store } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";

const TYPE_CLASSES = {
  full_time: "bg-caramel/10 text-caramel",
  part_time: "bg-blue-100 text-blue-700",
  casual: "bg-purple-100 text-purple-700",
};

export default function JobCard({
  job,
  ownerName,
  applied = false,
  actions = null,
}) {
  return (
    <div className="relative rounded-2xl border border-latte bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/jobs/${job.id}`}
            className="block truncate text-base font-bold text-espresso hover:text-caramel"
          >
            {job.title}
          </Link>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-medium text-espresso-soft">
            <Store size={12} /> {ownerName ?? "Coffee Shop"}
          </p>
        </div>
        <Badge classes={TYPE_CLASSES[job.employment_type]}>
          {EMPLOYMENT_LABELS[job.employment_type] ?? job.employment_type}
        </Badge>
      </div>

      {job.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-espresso-soft">
          {job.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-xs font-semibold text-espresso-soft">
          <MapPin size={13} className="text-caramel" />
          {job.location}
        </span>
        <span className="text-[11px] text-espresso-soft/70">
          {relativeTime(job.created_at)}
        </span>
      </div>

      {(applied || actions) && (
        <div className="mt-4 flex items-center gap-2 border-t border-latte/60 pt-4">
          {applied && !actions && (
            <Badge classes="bg-matcha/15 text-matcha">✓ Sudah dilamar</Badge>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}
