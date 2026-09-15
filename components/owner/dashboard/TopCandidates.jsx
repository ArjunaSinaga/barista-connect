import Link from "next/link";
import { Star, MapPin, Briefcase, Send, ChevronRight, Heart } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { avgStars } from "@/lib/ratings";

// Kartu kandidat ala mockup: foto + badge + nama + rating + quote + skill + 2 CTA.
export function badgeFor(b, rank) {
  if (b.is_open_to_work) return { label: "Available Now", cls: "bg-[#e3f0e8] text-[#1f6b4a]" };
  if ((b.certificates?.length ?? 0) > 0) return { label: "Certified", cls: "bg-[#e3f0e8] text-[#1f6b4a]" };
  if (rank === 0) return { label: "Top 1%", cls: "bg-[#f5ecd4] text-[#8a6d1f]" };
  return { label: "Top Match", cls: "bg-[#f5ecd4] text-[#8a6d1f]" };
}

export function CandidateCard({ barista, rank }) {
  const avg = avgStars(barista.ratings);
  const count = barista.ratings?.length ?? 0;
  const badge = badgeFor(barista, rank ?? 99);
  const photo = barista.profile_picture_url;
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e8e0cf] bg-[#ffffff] shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
      <div className="relative">
        {photo ? (
          <img src={photo} alt={barista.full_name} loading="lazy" className="aspect-[16/8] w-full object-cover" />
        ) : (
          <div className="flex aspect-[16/8] w-full items-center justify-center bg-[#efe9d9]">
            <Avatar name={barista.full_name} size="lg" />
          </div>
        )}
        <span className={`absolute top-2 left-2 rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}>
          {badge.label}
        </span>
        <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ffffff]/90 text-[#6f6252]">
          <Heart size={14} />
        </span>
      </div>
      <div className="p-3">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-[#2b2118]">
          <span className="truncate">{barista.full_name}</span>
          {barista.is_verified && <VerifiedBadge size={13} />}
        </p>
        <p className="text-[11px] text-[#857768]">Barista</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#857768]">
          <span className="inline-flex items-center gap-1"><MapPin size={10} />{barista.location_place ?? "-"}</span>
          <span className="inline-flex items-center gap-1"><Briefcase size={10} />{barista.years_of_experience ?? 0} thn</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#2b2118]">
          <Star size={11} className="fill-[#c98a2b] text-[#c98a2b]" />
          {avg ?? "-"} <span className="font-semibold text-[#857768]">({count})</span>
        </p>
        {(barista.cover_letter || barista.ideas_plus) && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-[#857768] italic">
            &ldquo;{(barista.cover_letter || barista.ideas_plus).slice(0, 90)}&rdquo;
          </p>
        )}
        {barista.skills?.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {barista.skills.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-[#f2ecdf] px-2 py-0.5 text-[10px] font-semibold text-[#6f6252]">{s}</span>
            ))}
            {barista.skills.length > 3 && (
              <span className="rounded-full bg-[#f2ecdf] px-2 py-0.5 text-[10px] font-semibold text-[#6f6252]">+{barista.skills.length - 3}</span>
            )}
          </div>
        )}
        <div className="mt-2 flex gap-1.5">
          <Link
            href={`/barista/${barista.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[#d8cdae] px-2 py-1.5 text-[11px] font-bold text-[#3d2c1e] hover:border-[#3d2c1e]"
          >
            View Profile
          </Link>
          <Link
            href={`/barista/${barista.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-[#3d2c1e] px-2 py-1.5 text-[11px] font-bold text-white hover:bg-[#2e2015]"
          >
            <Send size={11} /> Invite
          </Link>
        </div>
      </div>
    </div>
  );
}

export function TopCandidates({ baristas }) {
  if (!baristas?.length) return null;
  return (
    <section>
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-[#2b2118]">Top Candidates</h2>
          <p className="text-xs text-[#857768]">Barista berkualitas yang sesuai dengan preferensi cafe Anda.</p>
        </div>
        <Link href="/find-baristas" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#2b6cb0] hover:underline">
          Lihat semua talenta <ChevronRight size={13} />
        </Link>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {baristas.map((b, i) => (
          <CandidateCard key={b.id} barista={b} rank={i} />
        ))}
      </div>
    </section>
  );
}

// Baris ringkas untuk kolom kanan (Recommended / Certified).
export function TalentRow({ barista, tag }) {
  const avg = avgStars(barista.ratings);
  const count = barista.ratings?.length ?? 0;
  return (
    <Link href={`/barista/${barista.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#faf7ef]">
      <Avatar src={barista.profile_picture_url} name={barista.full_name} size="md" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[13px] font-extrabold text-[#2b2118]">{barista.full_name}</span>
          {tag && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tag.cls}`}>{tag.label}</span>
          )}
        </span>
        <span className="mt-0.5 block text-[11px] text-[#857768]">
          <Star size={10} className="mr-1 inline fill-[#c98a2b] text-[#c98a2b]" />
          {avg ?? "-"} ({count}) · {barista.years_of_experience ?? 0} tahun
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[#857768]">
          {barista.location_place ?? ""}{barista.skills?.length ? ` · ${barista.skills.slice(0, 2).join(", ")}` : ""}
        </span>
      </span>
      <ChevronRight size={15} className="shrink-0 text-[#b6a98f]" />
    </Link>
  );
}
