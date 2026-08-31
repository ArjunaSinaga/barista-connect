import Link from "next/link";
import { MapPin } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

export function OpenToWorkDot({ open }) {
  return (
    <Badge
      classes={
        open
          ? "bg-matcha/15 text-matcha"
          : "bg-gray-100 text-gray-500"
      }
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${open ? "bg-matcha pulse-dot" : "bg-gray-400"}`}
      />
      {open ? "Buka kerja" : "Sibuk"}
    </Badge>
  );
}

export default function BaristaCard({ barista, actions = null }) {
  return (
    <div className="flex flex-col rounded-2xl border border-latte bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <Avatar
          src={barista.profile_picture_url}
          name={barista.full_name}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/barista/${barista.id}`}
            className="block truncate font-bold text-espresso hover:text-caramel"
          >
            {barista.full_name}
          </Link>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-espresso-soft">
            <MapPin size={11} className="text-caramel" />
            {barista.location_place}
          </p>
          <div className="mt-2">
            <OpenToWorkDot open={barista.is_open_to_work} />
          </div>
        </div>
        <span className="shrink-0 rounded-xl bg-cream-dark px-2.5 py-1 text-[11px] font-extrabold text-espresso-soft">
          {barista.years_of_experience} th exp
        </span>
      </div>

      {barista.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {barista.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-caramel/10 px-2.5 py-1 text-[11px] font-bold text-caramel"
            >
              {s}
            </span>
          ))}
          {barista.skills.length > 3 && (
            <span className="rounded-full bg-cream-dark px-2.5 py-1 text-[11px] font-bold text-espresso-soft">
              +{barista.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {actions && (
        <div className="mt-auto flex items-center gap-2 pt-4">{actions}</div>
      )}
    </div>
  );
}
