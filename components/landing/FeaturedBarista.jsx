"use client";

import Link from "next/link";
import { Star, MapPin, Briefcase } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import Button from "@/components/ui/Button";
import { avgStars } from "@/lib/ratings";

// Featured barista card (kerja.inc style). All numbers computed from real data — no hardcoding.
export default function FeaturedBarista({ barista, isAnon }) {
  if (!barista) return null;
  const avg = avgStars(barista.ratings);
  const count = barista.ratings?.length ?? 0;
  const inviteHref = isAnon ? `/login?next=/barista/${barista.id}` : `/barista/${barista.id}`;
  return (
    <div className="rounded-2xl border border-[#2f2721]/12 bg-[#bdb29b] p-6 shadow-[0_2px_10px_rgba(26,15,10,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold tracking-tight">Featured Barista</h3>
        {barista.is_open_to_work && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1e3932]/10 px-2.5 py-1 text-[11px] font-bold text-[#1e3932]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1e3932]" />
            Available Now
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Avatar src={barista.profile_picture_url} name={barista.full_name} size="lg" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-lg font-bold">
            {barista.full_name}
            {barista.is_verified && <VerifiedBadge size={16} />}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#2f2721]/60">
            <Star size={12} className="fill-[#6f5a3e] text-[#6f5a3e]" />
            {avg ? `${avg} (${count} review${count > 1 ? "s" : ""})` : "No reviews yet"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#2f2721]/60">
            <span className="inline-flex items-center gap-1"><MapPin size={11} />{barista.location_place}</span>
            <span className="inline-flex items-center gap-1"><Briefcase size={11} />{barista.years_of_experience} yrs experience</span>
          </p>
        </div>
      </div>
      {(barista.cover_letter || barista.ideas_plus) && (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#2f2721]/70 italic">
          &ldquo;{(barista.cover_letter || barista.ideas_plus).slice(0, 160)}&rdquo;
        </p>
      )}
      {barista.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {barista.skills.slice(0, 5).map((s) => (
            <span key={s} className="rounded-full bg-[#2f2721]/10 px-2.5 py-1 text-[11px] font-bold text-[#2f2721]/70">{s}</span>
          ))}
        </div>
      )}
      <div className="mt-5 flex gap-2">
        <Button size="sm" full href={inviteHref}>Invite to Interview</Button>
        <Button size="sm" full variant="secondary" href={`/barista/${barista.id}`}>View Full Profile</Button>
      </div>
    </div>
  );
}
