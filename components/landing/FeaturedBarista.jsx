import { Star, MapPin, Briefcase } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import Button from "@/components/ui/Button";
import { avgStars } from "@/lib/ratings";

// Featured barista card — light kerja.inc style. All numbers computed from real data.
export default function FeaturedBarista({ barista, isAnon }) {
  if (!barista) return null;
  const avg = avgStars(barista.ratings);
  const count = barista.ratings?.length ?? 0;
  const inviteHref = isAnon ? `/login?next=/barista/${barista.id}` : `/barista/${barista.id}`;
  return (
    <div className="rounded-2xl border border-[#e8e0cf] bg-white p-5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2b2118]">Featured Barista</h3>
        {barista.is_open_to_work && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3f0e8] px-2.5 py-1 text-[11px] font-bold text-[#1f6b4a]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1f6b4a]" />
            Available Now
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Avatar src={barista.profile_picture_url} name={barista.full_name} size="lg" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-base font-bold text-[#2b2118]">
            {barista.full_name}
            {barista.is_verified && <VerifiedBadge size={15} />}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#857768]">
            <Star size={12} className="fill-[#c98a2b] text-[#c98a2b]" />
            {avg ? `${avg} (${count} review${count > 1 ? "s" : ""})` : "No reviews yet"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#857768]">
            <span className="inline-flex items-center gap-1"><MapPin size={11} />{barista.location_place}</span>
            <span className="inline-flex items-center gap-1"><Briefcase size={11} />{barista.years_of_experience} yrs experience</span>
          </p>
        </div>
      </div>
      {(barista.cover_letter || barista.ideas_plus) && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-5 text-[#857768] italic">
          &ldquo;{(barista.cover_letter || barista.ideas_plus).slice(0, 140)}&rdquo;
        </p>
      )}
      {barista.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {barista.skills.slice(0, 5).map((s) => (
            <span key={s} className="rounded-full bg-[#f2ecdf] px-2.5 py-1 text-[11px] font-semibold text-[#6f6252]">{s}</span>
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Button size="sm" full variant="coffee" href={inviteHref}>Invite to Interview</Button>
        <Button size="sm" full variant="secondary" href={`/barista/${barista.id}`} className="!border-[#e0d5bd] !bg-white !text-[#3d2c1e] hover:!border-[#3d2c1e]">View Full Profile</Button>
      </div>
    </div>
  );
}
