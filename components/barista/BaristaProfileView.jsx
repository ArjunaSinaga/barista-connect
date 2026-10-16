import Link from "next/link";
import { BadgeCheck, MapPin, Sparkles, Award, BriefcaseBusiness, FileText, ExternalLink, Download } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import StartChatButton from "@/components/chat/StartChatButton";
import EndorseSection from "@/components/social/EndorseSection";
import ConnectButton from "@/components/social/ConnectButton";
import RatingForm, { Stars } from "@/components/ratings/RatingForm";
import ShieldToggle from "@/components/ratings/ShieldToggle";
import { formatExp } from "@/lib/exp";
import { skillLabel } from "@/lib/constants";

export default function BaristaProfileView({
  b, workHistory = [], ratings = [], avg = null, portfolio = [],
  isSelf = false, isOwner = false, viewerId = null,
  rateableTeam = null, myRating = null, editHref = null,
}) {
  const ratingCount = ratings?.length ?? 0;
  return (
    <div className="min-h-screen bg-[#f3ede1]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
        <Link href="/talent" className="text-sm font-bold text-caramel hover:underline">← Kembali ke Talent</Link>

        {isSelf && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-caramel/30 bg-white px-5 py-3.5">
            <p className="text-sm font-semibold text-espresso">
              Ini tampilan publik profilmu — begini kafe lain melihatmu.
            </p>
            {editHref && (
              <Link href={editHref} className="rounded-full bg-[#2b2118] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
                Edit Profil
              </Link>
            )}
          </div>
        )}

        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Header profil */}
          <div className="rounded-2xl border border-[#e5d9c3] bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar src={b.profile_picture_url} name={b.full_name} size="xl" className="h-20 w-20 shrink-0 border-4 border-white shadow-md" />
              <div className="min-w-0 flex-1">
                <h1 className="flex flex-wrap items-center gap-1.5 font-serif text-3xl font-extrabold text-espresso">{b.full_name}{b.is_verified && <VerifiedBadge size={22} />}</h1>
                <p className="mt-1 text-sm font-semibold text-espresso-soft">Barista</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-espresso-soft">
                  <MapPin size={12} className="text-caramel" />
                  {b.location_place} • {formatExp(b.experience_months, b.years_of_experience)} pengalaman
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {b.is_open_to_work ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">Tersedia penuh waktu</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">Sedang tidak mencari kerja</span>
                  )}
                  {b.is_verified && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">Identitas terverifikasi</span>
                  )}
                </div>
                {((isOwner && viewerId) || (!isSelf && viewerId) || (isSelf && !editHref) || (!isSelf && !viewerId)) ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {isOwner && viewerId && <StartChatButton ownerId={viewerId} baristaId={b.id} />}
                    {!isSelf && viewerId && <ConnectButton targetId={b.id} viewerId={viewerId} />}
                    {!isSelf && viewerId && (
                      <Link href={`/login?next=/barista/${b.id}`} className="rounded-full border border-[#2b2118] px-4 py-2 text-sm font-bold text-espresso hover:bg-[#faf7ef]">
                        Simpan Talenta
                      </Link>
                    )}
                    {!isSelf && !viewerId && (
                      <Link href={`/login?next=/barista/${b.id}`} className="rounded-full bg-[#2b2118] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
                        Masuk untuk Menghubungi
                      </Link>
                    )}
                    {isSelf && !editHref && (
                      <Link href="/dashboard/barista/profile?edit=1" className="rounded-full bg-[#2b2118] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
                        Edit profil
                      </Link>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Statistik ringkas */}
          <div className="rounded-2xl border border-[#e5d9c3] bg-white px-6 py-6 shadow-sm">
            <p className="font-serif text-3xl font-black text-espresso">{avg ?? "–"} <span className="text-sm font-bold text-espresso-soft">/5</span></p>
            <p className="text-xs text-espresso-soft">dari {ratingCount} ulasan</p>
            <p className="mt-3 text-sm font-extrabold text-espresso">{workHistory.length} proyek selesai</p>
            <p className="text-xs font-bold text-green-700">100% tingkat penyelesaian</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {workHistory.length > 0 && (
              <section className="rounded-2xl border border-[#e5d9c3] bg-white p-6">
                <h2 className="font-serif text-lg font-extrabold text-espresso">Pengalaman Kerja</h2>
                <ul className="mt-3 space-y-3">
                  {workHistory.map((w, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 border-b border-[#f0e8d8] pb-3 last:border-0 last:pb-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3ede1] text-sm font-black text-caramel">{(w.owners?.business_name ?? "K").charAt(0)}</span>
                        <div className="min-w-0">
                          <Link href={`/owner/${w.owner_id}`} className="block truncate text-sm font-bold text-espresso hover:text-caramel hover:underline">
                            {w.job_title || "Barista"}
                          </Link>
                          <p className="truncate text-xs text-espresso-soft">{w.owners?.business_name ?? "Coffee shop"}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${w.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {w.status === "active" ? "Terverifikasi" : "Self-declared"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-2xl border border-[#e5d9c3] bg-white p-6">
              <h2 className="font-serif text-lg font-extrabold text-espresso">Ulasan dari Pemberi Kerja</h2>
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
                  <div className="flex items-center gap-2">
                    <Stars value={Math.round(avg)} size={18} />
                    <span className="text-lg font-black text-espresso">{avg}/5</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {(ratings ?? []).filter((r) => r.comment).slice(0, 5).map((r, i) => (
                      <li key={r.id ?? i} className="rounded-xl bg-[#faf7ef] px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <Stars value={r.stars} size={12} />
                          {isSelf && <ShieldToggle kind="tentang_saya_barista" id={r.id} hidden={r.hidden} />}
                        </div>
                        <p className="mt-1 text-sm text-espresso italic">&ldquo;{r.comment}&rdquo;</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-right">
                    <Link href={`/barista/${b.id}/reviews`} className="text-sm font-bold text-caramel hover:underline">Lihat Semua Ulasan →</Link>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-espresso-soft">Belum ada rating. Rating tampil segera setelah ada yang menilai.</p>
              )}
            </section>

            {portfolio.length > 0 && (
              <section className="rounded-2xl border border-[#e5d9c3] bg-white p-6">
                <h2 className="font-serif text-lg font-extrabold text-espresso">Portofolio ({portfolio.length})</h2>
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {portfolio.map((p) => (
                    <li key={p.id} className="overflow-hidden rounded-xl border border-[#e5d9c3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url} alt={p.caption || "Portofolio barista"} className="aspect-square w-full object-cover" loading="lazy" />
                      {p.caption && (
                        <p className="truncate bg-[#faf7ef] px-2.5 py-1.5 text-xs font-semibold text-espresso">{p.caption}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {b.cv_url ? (
              <section className="rounded-2xl border border-[#e5d9c3] bg-white p-6">
                <h2 className="flex items-center gap-1.5 font-serif text-lg font-extrabold text-espresso">
                  <FileText size={16} className="text-caramel" /> CV / Resume
                </h2>
                <iframe
                  src={b.cv_url}
                  title={`CV ${b.full_name}`}
                  className="mt-3 h-[480px] w-full rounded-xl border border-[#e5d9c3] bg-white"
                  loading="lazy"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={b.cv_url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#2b2118] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                  >
                    <ExternalLink size={14} /> Buka di tab baru
                  </a>
                  <a
                    href={b.cv_url}
                    download
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#2b2118] px-4 py-2 text-sm font-bold text-espresso hover:bg-[#faf7ef]"
                  >
                    <Download size={14} /> Unduh
                  </a>
                </div>
              </section>
            ) : (
              isSelf && (
                <section className="rounded-2xl border border-dashed border-[#e5d9c3] bg-white p-6 text-center">
                  <FileText size={20} className="mx-auto text-espresso-soft" />
                  <p className="mt-2 text-sm font-semibold text-espresso">Belum ada CV di profilmu</p>
                  <p className="mt-1 text-xs text-espresso-soft">Unggah CV lewat tombol Edit Profil agar kafe bisa melihatnya di sini.</p>
                </section>
              )
            )}
          </div>

          <div className="space-y-4">
            {b.skills?.length > 0 && (
              <section className="rounded-2xl border border-[#e5d9c3] bg-white p-6">
                <h2 className="font-serif text-lg font-extrabold text-espresso">Keahlian & Sertifikat</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.skills.map((s) => (
                    <span key={s} className="rounded-full bg-[#f3ede1] px-3 py-1.5 text-xs font-bold text-caramel">{skillLabel(s)}</span>
                  ))}
                </div>
                {b.certificates?.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {b.certificates.map((c, i) => (
                      <li key={`${c}-${i}`} className="flex items-center gap-2.5 rounded-xl bg-[#faf7ef] px-4 py-2.5 text-sm font-semibold text-espresso">
                        <Award size={15} className="shrink-0 text-caramel" />{c}
                      </li>
                    ))}
                  </ul>
                )}
                {!isSelf && viewerId && (
                  <EndorseSection baristaId={b.id} skills={b.skills} viewerId={viewerId} />
                )}
              </section>
            )}

            <section className="rounded-2xl border border-[#e5d9c3] bg-[#faf7ef] p-6">
              <h2 className="font-serif text-base font-extrabold text-espresso">Privasi pekerja</h2>
              <p className="mt-1 text-xs leading-relaxed text-espresso-soft">Kontak, KTP, dan dokumen tidak ditampilkan. Employer berinteraksi lewat undangan.</p>
              <div className="mt-3 text-right">
                <Link href="/help" className="text-xs font-bold text-caramel hover:underline">▸ Laporkan Profil</Link>
              </div>
            </section>

            {b.ideas_plus && (
              <section className="rounded-2xl border border-caramel/25 bg-white p-6 text-center">
                <h2 className="flex items-center justify-center gap-1.5 text-xs font-extrabold tracking-wide text-caramel uppercase"><Sparkles size={14} /> Ide & nilai plus</h2>
                <p className="mt-3 leading-relaxed text-espresso italic">&ldquo;{b.ideas_plus}&rdquo;</p>
              </section>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard icon={<BriefcaseBusiness size={16} />} label="Pengalaman" value={formatExp(b.experience_months, b.years_of_experience)} />
          <StatCard icon={<BadgeCheck size={16} />} label="Skill" value={`${b.skills?.length ?? 0}`} />
          <StatCard icon={<Award size={16} />} label="Sertifikat" value={`${b.certificates?.length ?? 0}`} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-[#e5d9c3] bg-white p-4 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3ede1] text-caramel">{icon}</span>
      <p className="text-lg leading-none font-extrabold text-espresso">{value}</p>
      <p className="text-[10px] font-bold tracking-wide text-espresso-soft uppercase">{label}</p>
    </div>
  );
}
