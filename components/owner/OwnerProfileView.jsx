import Link from "next/link";
import { MapPin, Store } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import StartChatButton from "@/components/chat/StartChatButton";
import CafeRatingForm from "@/components/ratings/CafeRatingForm";
import { Stars } from "@/components/ratings/RatingForm";

export default function OwnerProfileView({
  o, cafes = [], cafeRatings = [], avg = null,
  isSelf = false, isBarista = false, viewerId = null,
  myTeam = null, myRating = null, editHref = null,
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {isSelf && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-caramel/30 bg-caramel/10 px-5 py-3.5">
          <p className="text-sm font-semibold text-espresso">
            Ini tampilan publik bisnismu — begini barista lain melihatmu.
          </p>
          {editHref && (
            <Link href={editHref} className="rounded-xl bg-espresso px-4 py-2 text-sm font-bold text-white hover:bg-espresso/90">
              Edit Bisnis
            </Link>
          )}
        </div>
      )}
      <div className="rounded-2xl card-dark px-6 py-8 text-center shadow-sm">
        <Avatar src={o.avatar_url} name={o.business_name} size="xl" className="mx-auto border-4 border-white shadow-md" />
        <h1 className="mt-4 text-2xl font-extrabold text-espresso">{o.business_name}</h1>
        <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold text-espresso-soft">
          <MapPin size={13} className="text-caramel" />{o.location}
        </p>
        {avg && (
          <p className="mt-1.5 flex items-center justify-center gap-2">
            <Stars value={Math.round(avg)} size={16} />
            <span className="text-sm font-black text-espresso">{avg}/5</span>
            <span className="text-xs text-espresso-soft">({cafeRatings.length} ulasan)</span>
          </p>
        )}
        {isBarista && viewerId && (
          <div className="mt-4 flex justify-center">
            <StartChatButton ownerId={o.id} baristaId={viewerId} />
          </div>
        )}
      </div>

      <section className="mt-4 rounded-2xl card-dark p-6 text-center">
        <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">Cabang ({cafes?.length ?? 0})</h2>
        {(cafes ?? []).length === 0 && <p className="mt-2 text-sm text-espresso-soft">Belum ada cafe terdaftar.</p>}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(cafes ?? []).map((c) => (
            <Link key={c.id} href={`/cafes/${c.id}`} className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2.5 hover:bg-cream-dark">
              {c.photo_urls?.[0] ? (
                <img src={c.photo_urls[0]} alt={c.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cream-dark text-caramel"><Store size={20} /></span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-espresso">{c.name}</span>
                <span className="block truncate text-xs text-espresso-soft">{c.location || "-"}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl card-dark p-6 text-center">
        <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">Rating dari barista ({cafeRatings.length})</h2>
        {isBarista && myTeam && (
          <div className="mt-3">
            <CafeRatingForm teamMemberId={myTeam.id} ownerId={o.id} baristaId={viewerId} isTerminated existing={myRating} />
          </div>
        )}
        {isBarista && !myTeam && !isSelf && (
          <p className="mt-2 text-sm text-espresso-soft">Kamu bisa menilai cafe ini setelah selesai bekerja di sini.</p>
        )}
        {cafeRatings.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {cafeRatings.filter((r) => r.comment).slice(0, 10).map((r, i) => (
              <li key={i} className="rounded-xl bg-cream px-4 py-3">
                <Stars value={r.stars} size={12} />
                <p className="mt-1 text-sm text-espresso italic">&ldquo;{r.comment}&rdquo;</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-espresso-soft">Belum ada ulasan publik. Ulasan tampil setelah kedua pihak saling menilai.</p>
        )}
      </section>
    </div>
  );
}
