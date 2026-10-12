import { MapPin, Star, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { OpenToWorkDot } from "@/components/cards/BaristaCard";
import { formatExpShort } from "@/lib/exp";
import { skillLabel } from "@/lib/constants";

// Panel profil singkat talenta — dipasang di kanan saat 1 kartu diklik,
// pola sama seperti JobDetailPanel di /jobs (fx-panel-enter).
export default function BaristaDetailPanel({ barista, onClose, onChat }) {
  const rs = (barista.ratings ?? []).map((r) => r.stars).filter((s) => typeof s === "number");
  const avg = rs.length ? (rs.reduce((a, v) => a + v, 0) / rs.length) : null;
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5 shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar src={barista.profile_picture_url} name={barista.full_name} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-espresso">{barista.full_name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-espresso-soft">
              <MapPin size={11} className="text-caramel" />
              {barista.location_place ?? "-"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup panel"
          className="fx-press rounded-full border border-[#e0d5bd] p-1.5 text-espresso-soft hover:border-coffee hover:text-espresso"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <OpenToWorkDot open={barista.is_open_to_work} />
        <span className="rounded-xl bg-cream-dark px-2.5 py-1 text-[11px] font-extrabold text-espresso-soft">
          {formatExpShort(barista.experience_months, barista.years_of_experience)}
        </span>
        {avg !== null && (
          <span className="inline-flex items-center gap-1 rounded-xl bg-gold/15 px-2.5 py-1 text-[11px] font-extrabold text-espresso">
            <Star size={11} className="fill-gold text-gold" />
            {avg.toFixed(1)} ({rs.length})
          </span>
        )}
      </div>

      {barista.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {barista.skills.slice(0, 5).map((s) => (
            <span key={s} className="rounded-full bg-caramel/10 px-2.5 py-1 text-[11px] font-bold text-caramel">
              {skillLabel(s)}
            </span>
          ))}
        </div>
      )}

      {(barista.cover_letter || barista.ideas_plus) && (
        <p className="mt-3 line-clamp-3 text-xs leading-5 text-espresso-soft">
          {barista.cover_letter ?? barista.ideas_plus}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" href={`/barista/${barista.id}`}>
          Lihat Profil
        </Button>
        <Button variant="secondary" size="sm" onClick={onChat}>
          Chat
        </Button>
      </div>
    </div>
  );
}
