import Link from "next/link";
import Image from "next/image";
import { thumb } from "@/lib/img";
import { MapPin, Store } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import StartChatButton from "@/components/chat/StartChatButton";
import CafeRatingForm from "@/components/ratings/CafeRatingForm";
import { Stars } from "@/components/ratings/RatingForm";
import ShieldToggle from "@/components/ratings/ShieldToggle";

export default function OwnerProfileView({
  o, cafes = [], cafeRatings = [], avg = null,
  isSelf = false, isBarista = false, viewerId = null,
  myTeam = null, myRating = null, editHref = null,
}) {
  const activeCount = cafes?.length ?? 0;
  return (
    <div className="min-h-screen bg-[#f3ede1]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
        <Link href="/cafes" className="text-sm font-bold text-caramel hover:underline">← Kembali</Link>

        {isSelf && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-caramel/30 bg-white px-5 py-3.5">
            <p className="text-sm font-semibold text-espresso">
              Ini tampilan publik bisnismu — begini barista lain melihatmu.
            </p>
            {editHref && (
              <Link href={editHref} className="rounded-full bg-[#2b2118] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
                Edit Bisnis
              </Link>
            )}
          </div>
        )}

        {/* Header bisnis */}
        <div className="mt-3 rounded-2xl border border-[#e5d9c3] bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar src={o.avatar_url} name={o.business_name} size="xl" className="h-20 w-20 shrink-0 rounded-2xl border-4 border-white shadow-md" />
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 font-serif text-3xl font-extrabold text-espresso">
                {o.business_name}
                {o.is_verified && <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">Bisnis terverifikasi</span>}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-espresso-soft">
                <MapPin size={12} className="text-caramel" />{o.location}
              </p>
              <p className="mt-1.5 text-xs font-bold text-espresso">
                {activeCount} outlet aktif • {avg ? `${avg}/5 dari ${cafeRatings.length} ulasan pekerja` : "Belum ada ulasan"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {isBarista && viewerId && (
                  <Link href={`/login?next=/owner/${o.id}`} className="rounded-full border border-[#2b2118] px-4 py-2 text-sm font-bold text-espresso hover:bg-[#faf7ef]">
                    + Ikuti
                  </Link>
                )}
                <Link href={`/jobs?employer=${o.id}`} className="rounded-full bg-[#2b2118] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
                  Lihat Semua Lowongan
                </Link>
                {isBarista && viewerId && (
                  <StartChatButton ownerId={o.id} baristaId={viewerId} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
          <section className="rounded-2xl border border-[#e5d9c3] bg-white p-6">
            <h2 className="font-serif text-lg font-extrabold text-espresso">Outlet</h2>
            {(cafes ?? []).length === 0 && <p className="mt-2 text-sm text-espresso-soft">Belum ada kafe terdaftar.</p>}
            <div className="mt-3 space-y-3">
              {(cafes ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 border-b border-[#f0e8d8] pb-3 last:border-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    {c.photo_urls?.[0] ? (
                      <Image src={thumb(c.photo_urls[0], { w: 96 })} alt={c.name} width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f3ede1] text-caramel"><Store size={20} /></span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-espresso">{c.name}</span>
                      <span className="block truncate text-xs text-espresso-soft">{c.location || "-"}</span>
                    </span>
                  </div>
                  <Link href={`/cafes/${c.id}`} className="shrink-0 rounded-full bg-[#2b2118] px-4 py-2 text-xs font-bold text-white hover:opacity-90">
                    Lihat Kafe
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-[#e5d9c3] bg-white p-6">
              <h2 className="font-serif text-lg font-extrabold text-espresso">Ulasan dari Pekerja</h2>
              {isBarista && myTeam && (
                <div className="mt-3">
                  <CafeRatingForm teamMemberId={myTeam.id} ownerId={o.id} baristaId={viewerId} isTerminated existing={myRating} />
                </div>
              )}
              {isBarista && !myTeam && !isSelf && (
                <p className="mt-2 text-sm text-espresso-soft">Kamu bisa menilai kafe ini setelah selesai bekerja di sini.</p>
              )}
              {avg && (
                <p className="mt-2 text-sm font-black text-espresso">★ {avg}</p>
              )}
              {cafeRatings.length > 0 ? (
                <>
                  <ul className="mt-3 space-y-2">
                    {cafeRatings.filter((r) => r.comment).slice(0, 10).map((r, i) => (
                      <li key={r.id ?? i} className="rounded-xl bg-[#faf7ef] px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <Stars value={r.stars} size={12} />
                          {isSelf && <ShieldToggle kind="tentang_kafe_saya" id={r.id} hidden={r.hidden} />}
                        </div>
                        <p className="mt-1 text-sm text-espresso italic">&ldquo;{r.comment}&rdquo;</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-right">
                    <Link href={`/owner/${o.id}/reviews`} className="text-sm font-bold text-caramel hover:underline">Lihat Semua Ulasan →</Link>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-espresso-soft">Belum ada ulasan. Rating tampil segera setelah ada yang menilai.</p>
              )}
            </section>

            <section className="rounded-2xl border border-[#e5d9c3] bg-[#faf7ef] p-6">
              <p className="text-xs leading-relaxed text-espresso-soft">Kontak pribadi owner tidak ditampilkan. Gunakan Lamar atau pesan lamaran.</p>
              <div className="mt-3 text-right">
                <Link href="/help" className="text-xs font-bold text-caramel hover:underline">▸ Laporkan</Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
