import Link from "next/link";
import Image from "next/image";
import {
  UserRound, FileText, Sparkles, Bell, MessageCircle, Settings, Star,
  Briefcase, ShieldCheck, Pencil, MapPin, Clock, BadgeCheck,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import SignOutButton from "@/components/barista/SignOutButton";
import { skillLabel, EMPLOYMENT_LABELS } from "@/lib/constants";
import { formatExpShort } from "@/lib/exp";
import { relativeTime } from "@/lib/time";

// UI-09 Worker Profile (halaman sendiri): header + stats + Tentang + Pengalaman +
// Portofolio + Ulasan + kolom Keahlian/Sertifikat/Info. Pendidikan tidak dirender:
// tidak ada kolom pendidikan di DB — tidak dikarang.
export default function WorkerProfileView({ b, workHistory, ratings, avg, ratingCount, portfolio, completedCount, completeness, editHref }) {
  const navRow = (active) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold ${
      active ? "bg-[#efe9d9] text-espresso" : "text-espresso-soft hover:bg-[#faf7ef] hover:text-espresso"
    }`;
  const skills = b.skills ?? [];
  const certs = b.certificates ?? [];
  const openTypes = (b.open_to_types ?? []).map((t) => EMPLOYMENT_LABELS[t] ?? t);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid items-start gap-4 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)_300px]">
        {/* Sidebar */}
        <nav aria-label="Profil" className="rounded-2xl border border-[#e8e0cf] bg-white p-2 max-lg:flex max-lg:gap-1 max-lg:overflow-x-auto">
          <span className={navRow(true)}><UserRound size={17} className="shrink-0" /><span className="flex-1 text-left max-lg:hidden">Profil Saya</span></span>
          <Link href="/dashboard/barista/applications" className={navRow(false)}><FileText size={17} className="shrink-0" /><span className="flex-1 text-left max-lg:hidden">Lamaran Saya</span></Link>
          <Link href="/jobs?reco=1" className={navRow(false)}><Sparkles size={17} className="shrink-0" /><span className="flex-1 text-left max-lg:hidden">Rekomendasi</span></Link>
          <Link href="/dashboard/barista/notifikasi" className={navRow(false)}><Bell size={17} className="shrink-0" /><span className="flex-1 text-left max-lg:hidden">Notifikasi</span></Link>
          <Link href="/messages" className={navRow(false)}><MessageCircle size={17} className="shrink-0" /><span className="flex-1 text-left max-lg:hidden">Pesan</span></Link>
          <Link href={editHref} className={navRow(false)}><Settings size={17} className="shrink-0" /><span className="flex-1 text-left max-lg:hidden">Pengaturan</span></Link>
          <span className="max-lg:hidden"><SignOutButton /></span>
        </nav>

        {/* Tengah */}
        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Avatar src={b.profile_picture_url} name={b.full_name} size="xl" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h1 className="flex items-center gap-1.5 text-2xl font-extrabold text-espresso">
                    {b.full_name}{b.is_verified && <VerifiedBadge size={20} />}
                  </h1>
                  <Link href={editHref} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e0d5bd] px-3.5 py-1.5 text-xs font-bold text-espresso hover:border-coffee">
                    <Pencil size={12} /> Edit Profil
                  </Link>
                </div>
                <p className="mt-0.5 text-sm font-bold text-espresso-soft">
                  {skills.slice(0, 2).map(skillLabel).join(" & ") || "Barista"}
                </p>
                <p className="mt-1.5 space-y-1 text-[13px] text-espresso-soft">
                  <span className="flex items-center gap-1.5"><MapPin size={13} />{b.location_place ?? "-"}</span>
                  <span className="flex items-center gap-1.5"><Briefcase size={13} />{formatExpShort(b.experience_months, b.years_of_experience)} pengalaman</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} />{b.is_open_to_work ? "Tersedia untuk kerja" : "Sedang tidak tersedia"}</span>
                </p>
              </div>
              {/* Stats */}
              <div className="grid shrink-0 grid-cols-3 gap-3 sm:grid-cols-1 sm:w-40">
                <div className="rounded-xl bg-[#faf7ef] p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-espresso">
                    <Star size={16} className="fill-[#c98a2b] text-[#c98a2b]" />{avg ?? "-"}
                  </p>
                  <p className="text-[10px] text-espresso-soft">Dari {ratingCount} ulasan</p>
                </div>
                <div className="rounded-xl bg-[#faf7ef] p-3 text-center">
                  <p className="text-lg font-extrabold text-espresso tabular-nums">{completedCount}</p>
                  <p className="text-[10px] text-espresso-soft">Proyek selesai</p>
                </div>
                <div className="rounded-xl bg-[#faf7ef] p-3 text-center">
                  <p className="text-lg font-extrabold text-espresso tabular-nums">{completeness}%</p>
                  <p className="text-[10px] text-espresso-soft">Profil lengkap</p>
                </div>
              </div>
            </div>
            {b.is_verified ? (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-xs font-bold text-green-700">
                <ShieldCheck size={15} /> Identitas Terverifikasi — data pribadi telah diverifikasi oleh kerja.inc
              </p>
            ) : (
              <p className="mt-3 rounded-xl bg-[#fff8e8] px-4 py-2.5 text-xs font-bold text-espresso-soft">
                Identitas belum terverifikasi. <Link href="/verify" className="text-link hover:underline">Verifikasi sekarang →</Link>
              </p>
            )}
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="rounded-full bg-[#efe9d9] px-3 py-1 text-[11px] font-bold text-espresso-soft">{skillLabel(s)}</span>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-espresso">Tentang Saya</h2>
              <Link href={editHref} className="inline-flex items-center gap-1 rounded-full border border-[#e0d5bd] px-3 py-1 text-[11px] font-bold hover:border-coffee"><Pencil size={11} /> Edit</Link>
            </div>
            {b.ideas_plus ? (
              <p className="mt-2 text-sm leading-7 whitespace-pre-line text-espresso-soft">{b.ideas_plus}</p>
            ) : (
              <p className="mt-2 text-sm text-espresso-soft">Belum ada cerita. <Link href={editHref} className="font-bold text-link hover:underline">Tulis tentang dirimu →</Link></p>
            )}
          </section>

          <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
            <h2 className="text-base font-extrabold text-espresso">Pengalaman Kerja</h2>
            {workHistory.length ? (
              <ol className="mt-3 space-y-4">
                {workHistory.map((w, i) => (
                  <li key={`${w.owner_id}-${i}`} className="flex gap-3">
                    <span className="flex flex-col items-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-coffee" />
                      {i < workHistory.length - 1 && <span className="w-px flex-1 bg-[#e8e0cf]" />}
                    </span>
                    <div className="min-w-0 flex-1 pb-1">
                      <p className="text-sm font-extrabold text-espresso">{w.job_title || "Barista"}</p>
                      <p className="text-xs text-espresso-soft">{w.owners?.business_name ?? "-"}</p>
                      <p className="mt-0.5 text-[11px] text-[#b6a98f]">
                        {w.hired_at ? `Sejak ${relativeTime(w.hired_at)}` : "-"}
                        {w.status === "terminated" ? " • Selesai" : " • Aktif"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-espresso-soft">Belum ada riwayat kerja tercatat. <Link href="/jobs" className="font-bold text-link hover:underline">Cari kerja →</Link></p>
            )}
          </section>

          {portfolio.length > 0 && (
            <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-espresso">Portofolio / Dokumen</h2>
                <Link href={editHref} className="rounded-full border border-[#e0d5bd] px-3 py-1 text-[11px] font-bold hover:border-coffee">+ Tambah File</Link>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {portfolio.slice(0, 3).map((p) => (
                  <div key={p.id} className="relative h-24 overflow-hidden rounded-xl">
                    <Image src={p.image_url} alt={p.caption || "Portofolio"} fill className="object-cover" sizes="160px" />
                  </div>
                ))}
                {portfolio.length > 3 && (
                  <Link href={editHref} className="relative flex h-24 items-center justify-center overflow-hidden rounded-xl bg-black/55 text-lg font-extrabold text-white">
                    +{portfolio.length - 3}
                  </Link>
                )}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5 sm:p-6">
            <h2 className="text-base font-extrabold text-espresso">Ulasan dari Pemberi Kerja</h2>
            {ratings.length ? (
              <ul className="mt-3 space-y-3">
                {ratings.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex gap-3 rounded-xl bg-[#faf7ef] p-3.5">
                    <Avatar src={null} name={r.ownerName} size="md" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 text-[13px]">
                        <span className="font-extrabold text-espresso">{r.ownerName}</span>
                        <span className="inline-flex items-center gap-0.5 font-bold text-espresso">
                          <Star size={11} className="fill-[#c98a2b] text-[#c98a2b]" />{(r.stars ?? 0).toFixed(1)}
                        </span>
                        <span className="text-[11px] text-[#b6a98f]">{relativeTime(r.created_at)}</span>
                      </p>
                      {r.comment && <p className="mt-1 text-[13px] leading-5 text-espresso-soft">{r.comment}</p>}
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-green-700"><BadgeCheck size={12} /> Proyek terverifikasi</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-espresso-soft">Belum ada ulasan. Selesaikan pekerjaan untuk mengumpulkan reputasi.</p>
            )}
          </section>
        </div>

        {/* Kanan */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-espresso">Keahlian</h2>
              <Link href={editHref} className="inline-flex items-center gap-1 rounded-full border border-[#e0d5bd] px-3 py-1 text-[11px] font-bold hover:border-coffee"><Pencil size={11} /> Edit</Link>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="rounded-full bg-[#efe9d9] px-2.5 py-1 text-[11px] font-bold text-espresso-soft">{skillLabel(s)}</span>
              ))}
              {!skills.length && <p className="text-xs text-espresso-soft">Belum ada skill.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-espresso">Sertifikat</h2>
              <Link href={editHref} className="rounded-full border border-[#e0d5bd] px-3 py-1 text-[11px] font-bold hover:border-coffee">+ Tambah</Link>
            </div>
            {certs.length ? (
              <ul className="mt-2.5 space-y-2">
                {certs.map((c, i) => (
                  <li key={`${c}-${i}`} className="flex items-center gap-2.5 rounded-xl bg-[#faf7ef] px-3.5 py-2.5 text-[13px] font-bold text-espresso">
                    <BadgeCheck size={15} className="shrink-0 text-caramel" />{c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-espresso-soft">Belum ada sertifikat.</p>
            )}
          </section>

          <section className="rounded-2xl border border-[#e8e0cf] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-espresso">Informasi Tambahan</h2>
              <Link href={editHref} className="inline-flex items-center gap-1 rounded-full border border-[#e0d5bd] px-3 py-1 text-[11px] font-bold hover:border-coffee"><Pencil size={11} /> Edit</Link>
            </div>
            <dl className="mt-2.5 space-y-2 text-[13px]">
              <div className="flex gap-2"><dt className="w-24 shrink-0 text-espresso-soft">Jenis</dt><dd className="font-bold text-espresso">{openTypes.join(", ") || "-"}</dd></div>
              <div className="flex gap-2"><dt className="w-24 shrink-0 text-espresso-soft">Lokasi</dt><dd className="font-bold text-espresso">{b.location_place ?? "-"}</dd></div>
              <div className="flex gap-2"><dt className="w-24 shrink-0 text-espresso-soft">Status</dt><dd className="font-bold text-espresso">{b.is_open_to_work ? "Terbuka untuk kerja" : "Tidak tersedia"}</dd></div>
            </dl>
          </section>

          <section className="rounded-2xl bg-[#fff8e8] p-5 text-xs">
            <p className="text-sm font-extrabold text-espresso">Tips agar Profil Lebih Menarik</p>
            <ul className="mt-2 space-y-1.5 leading-relaxed text-espresso-soft">
              {["Gunakan foto yang jelas dan profesional", "Tulis tentang dirimu secara singkat dan menarik", "Tambahkan pengalaman kerja dan sertifikat", "Lengkapi portofolio bila ada", "Jaga reputasi dengan memberikan yang terbaik"].map((t) => (
                <li key={t} className="flex gap-1.5"><BadgeCheck size={13} className="mt-0.5 shrink-0 text-green-600" />{t}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
