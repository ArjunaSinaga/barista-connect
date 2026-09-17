import Link from "next/link";
import { BadgeCheck, MapPin, Sparkles, Award, BriefcaseBusiness } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import StartChatButton from "@/components/chat/StartChatButton";
import RatingForm, { Stars } from "@/components/ratings/RatingForm";

export default function BaristaProfileView({
  b, workHistory = [], ratings = [], avg = null,
  isSelf = false, isOwner = false, viewerId = null,
  rateableTeam = null, myRating = null, editHref = null,
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {isSelf && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-caramel/30 bg-caramel/10 px-5 py-3.5">
          <p className="text-sm font-semibold text-espresso">
            Ini tampilan publik profilmu — begini kafe lain melihatmu.
          </p>
          {editHref && (
            <Link href={editHref} className="rounded-xl bg-[#3d2c1e] px-4 py-2 text-sm font-bold text-white hover:bg-[#2e2015]">
              Edit Profil
            </Link>
          )}
        </div>
      )}
      <div className="rounded-2xl card-dark px-6 py-8 text-center shadow-sm">
        <Avatar src={b.profile_picture_url} name={b.full_name} size="xl" className="mx-auto border-4 border-white shadow-md" />
        <h1 className="mt-4 flex items-center justify-center gap-1.5 text-2xl font-extrabold text-espresso">{b.full_name}{b.is_verified && <VerifiedBadge size={22} />}</h1>
        <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-espresso-soft">
          <MapPin size={13} className="text-caramel" />
          {b.location_place} • {b.age} tahun
        </p>
        <div className="mt-4 flex justify-center">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${b.is_open_to_work ? "bg-matcha/15 text-matcha" : "bg-gray-100 text-gray-500"}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${b.is_open_to_work ? "bg-matcha pulse-dot" : "bg-gray-400"}`} />
            {b.is_open_to_work ? "Terbuka untuk peluang kerja" : "Sedang tidak mencari kerja"}
          </div>
        </div>
        {(isOwner && viewerId) || (isSelf && !editHref) ? (
          <div className="mt-4 flex justify-center">
            {isOwner && viewerId && <StartChatButton ownerId={viewerId} baristaId={b.id} />}
            {isSelf && !editHref && (
              <Link href="/dashboard/barista/profile?edit=1" className="rounded-xl bg-[#3d2c1e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2e2015]">
                Edit profil
              </Link>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard icon={<BriefcaseBusiness size={16} />} label="Pengalaman" value={`${b.years_of_experience} tahun`} />
        <StatCard icon={<BadgeCheck size={16} />} label="Skill" value={`${b.skills?.length ?? 0}`} />
        <StatCard icon={<Award size={16} />} label="Sertifikat" value={`${b.certificates?.length ?? 0}`} />
      </div>

      {workHistory.length > 0 && (
        <section className="mt-4 rounded-2xl card-dark p-6">
          <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">Riwayat Kerja ({workHistory.length})</h2>
          <ul className="mt-3 space-y-2">
            {workHistory.map((w, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3">
                <div className="min-w-0">
                  <Link href={`/owner/${w.owner_id}`} className="block truncate text-sm font-bold text-espresso hover:text-caramel hover:underline">
                    {w.owners?.business_name ?? "Coffee shop"}
                  </Link>
                  <p className="truncate text-xs text-espresso-soft">{w.job_title || "Barista"}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${w.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  {w.status === "active" ? "Aktif" : "Selesai"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4 rounded-2xl card-dark p-6 text-center">
        <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">Rating dari kafe ({ratings?.length ?? 0})</h2>
        {isOwner && rateableTeam && (
          <div className="mt-3">
            <RatingForm teamMemberId={rateableTeam.id} ownerId={viewerId} baristaId={b.id} existing={myRating} />
          </div>
        )}
        {isOwner && !rateableTeam && (
          <p className="mt-2 text-sm text-espresso-soft">Barista ini belum pernah melamar di tempatmu — rating tersedia setelah ada lamaran.</p>
        )}
        {avg ? (
          <div className="mt-3">
            <div className="flex items-center justify-center gap-2">
              <Stars value={Math.round(avg)} size={18} />
              <span className="text-lg font-black text-espresso">{avg}/5</span>
            </div>
            <ul className="mt-3 space-y-2">
              {(ratings ?? []).filter((r) => r.comment).slice(0, 5).map((r, i) => (
                <li key={i} className="rounded-xl bg-cream px-4 py-3">
                  <Stars value={r.stars} size={12} />
                  <p className="mt-1 text-sm text-espresso italic">&ldquo;{r.comment}&rdquo;</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-sm text-espresso-soft">Belum ada rating. Rating tampil segera setelah ada yang menilai.</p>
        )}
      </section>

      {b.skills?.length > 0 && (
        <section className="mt-4 rounded-2xl card-dark p-6 text-center">
          <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">Keahlian</h2>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {b.skills.map((s) => (
              <span key={s} className="rounded-full bg-caramel/10 px-3 py-1.5 text-xs font-bold text-caramel">{s}</span>
            ))}
          </div>
        </section>
      )}

      {b.certificates?.length > 0 && (
        <section className="mt-4 rounded-2xl card-dark p-6 text-center">
          <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">Sertifikat</h2>
          <ul className="mt-3 space-y-2">
            {b.certificates.map((c, i) => (
              <li key={`${c}-${i}`} className="flex items-center gap-2.5 rounded-xl bg-cream px-4 py-3 text-sm font-semibold text-espresso">
                <Award size={15} className="shrink-0 text-caramel" />{c}
              </li>
            ))}
          </ul>
        </section>
      )}

      {b.ideas_plus && (
        <section className="mt-4 rounded-2xl border border-caramel/25 bg-caramel/5 p-6 text-center">
          <h2 className="flex items-center justify-center gap-1.5 text-xs font-extrabold tracking-wide text-caramel uppercase"><Sparkles size={14} /> Ide & nilai plus</h2>
          <p className="mt-3 leading-relaxed text-espresso italic">&ldquo;{b.ideas_plus}&rdquo;</p>
        </section>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl card-dark p-4 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-dark text-caramel">{icon}</span>
      <p className="text-lg leading-none font-extrabold text-espresso">{value}</p>
      <p className="text-[10px] font-bold tracking-wide text-espresso-soft uppercase">{label}</p>
    </div>
  );
}
