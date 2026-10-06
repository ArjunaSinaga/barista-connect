import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, Award, Store, UsersRound, BadgeCheck, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/ui/Avatar";

export async function generateMetadata() {
  return { title: "Profil Akademi" };
}

// ponytail: halaman publik academy — hero, cara ikut, kursus, instruktur,
// kafe partner, lulusan, verifikasi. Tanpa tabel baru.
export default async function AcademyPublicPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: a } = await supabase
    .from("academy_profiles")
    .select("id, name, description, logo_url, partner_cafe_ids, instructors")
    .eq("id", id)
    .maybeSingle();
  if (!a) notFound();

  const partnerIds = a.partner_cafe_ids ?? [];
  const [{ data: cafes }, { data: issues, count }] = await Promise.all([
    partnerIds.length
      ? supabase.from("cafes").select("id, name, location").in("id", partnerIds).eq("is_active", true)
      : Promise.resolve({ data: [] }),
    supabase.from("certificate_issues")
      .select("label, barista_id, created_at", { count: "exact" })
      .eq("issuer_id", id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  const gradIds = [...new Set((issues ?? []).map((i) => i.barista_id))];
  let gradNames = {};
  if (gradIds.length) {
    const { data } = await supabase.from("baristas_public").select("id, full_name").in("id", gradIds);
    gradNames = Object.fromEntries((data ?? []).map((b) => [b.id, b.full_name]));
  }
  const instructors = a.instructors ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] text-espresso-soft uppercase">
        <GraduationCap size={13} /> Akademi Barista
      </p>
      <div className="mt-2 flex items-center gap-4">
        <Avatar src={a.logo_url} name={a.name} size="lg" />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-espresso sm:text-3xl">{a.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-espresso-soft">
            <span className="inline-flex items-center gap-1"><Award size={12} /> {count ?? 0} sertifikat diterbitkan</span>
            <span className="inline-flex items-center gap-1"><Store size={12} /> {(cafes ?? []).length} kafe partner</span>
            <span className="inline-flex items-center gap-1"><UsersRound size={12} /> {gradIds.length} lulusan tercatat</span>
          </p>
        </div>
      </div>
      {a.description && <p className="mt-3 max-w-xl text-sm leading-6 text-espresso-soft">{a.description}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/training" className="inline-flex min-h-[40px] items-center rounded-full bg-coffee px-5 text-xs font-bold text-white hover:bg-[#2e2015]">
          Lihat kursus
        </Link>
        <Link href="/verify-cert" className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#d8cdae] px-5 text-xs font-bold text-espresso hover:border-coffee">
          <BadgeCheck size={13} /> Verifikasi sertifikat
        </Link>
      </div>

      <section className="mt-6 rounded-2xl card-dark p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
          <ListChecks size={14} /> Cara ikut training
        </h2>
        <ol className="mt-2 space-y-2 text-xs leading-5 text-espresso-soft">
          <li><span className="font-extrabold text-espresso">1. Gabung waitlist</span> — pilih kursus di halaman training, isi email.</li>
          <li><span className="font-extrabold text-espresso">2. Training tatap muka</span> — jadwal & pembayaran diatur langsung dengan akademi.</li>
          <li><span className="font-extrabold text-espresso">3. Sertifikat terbit</span> — tercatat permanen di BarisCon dan bisa diverifikasi siapa saja.</li>
        </ol>
      </section>

      {instructors.length > 0 && (
        <section className="mt-4 rounded-2xl card-dark p-4">
          <h2 className="text-sm font-extrabold text-espresso">Siapa yang mengajar</h2>
          <ul className="mt-2 space-y-2">
            {instructors.map((ins, i) => (
              <li key={`${ins.name}-${i}`} className="rounded-xl border border-[#e8e0cf] bg-white px-3 py-2 text-xs">
                <span className="font-bold text-espresso">{ins.name}</span>
                {ins.credential && <span className="text-espresso-soft"> · {ins.credential}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(cafes ?? []).length > 0 && (
        <section className="mt-4 rounded-2xl card-dark p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
            <Store size={14} /> Kafe partner
          </h2>
          <p className="mt-0.5 text-xs text-espresso-soft">Lulusan berpeluang langsung direkrut di sini.</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {(cafes ?? []).map((c) => (
              <li key={c.id} className="rounded-xl border border-[#e8e0cf] bg-white px-3 py-2 text-xs">
                <span className="font-bold text-espresso">{c.name}</span>
                {c.location && <span className="block text-espresso-soft">{c.location}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(issues ?? []).length > 0 && (
        <section className="mt-4 rounded-2xl card-dark p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
            <UsersRound size={14} /> Lulusan tersertifikasi
          </h2>
          <ul className="mt-2 space-y-1.5 text-xs">
            {(issues ?? []).map((i, idx) => (
              <li key={`${i.barista_id}-${i.label}-${idx}`} className="flex items-center justify-between gap-2 rounded-xl border border-[#e8e0cf] bg-white px-3 py-2">
                <span className="min-w-0 truncate text-espresso">
                  <span className="font-bold">{gradNames[i.barista_id] ?? "Barista"}</span>
                  <span className="text-espresso-soft"> · {i.label}</span>
                </span>
                <span className="shrink-0 text-[11px] text-espresso-soft">{new Date(i.created_at).toLocaleDateString("id-ID")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
