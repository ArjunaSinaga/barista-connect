import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Award, Store, History } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import IssueCertButton from "@/components/owner/IssueCertButton";
import PartnerManager from "@/components/academy/PartnerManager";
import InstructorManager from "@/components/academy/InstructorManager";

export const metadata = { title: "Dashboard Academy" };

// ponytail: 1 halaman academy — profil + kafe partner (relasi beneran) +
// terbitkan sertif ke barista mana saja (termasuk lulusan lama) + riwayat.
export default async function AcademyDashboardPage({ searchParams }) {
  if (!isSupabaseConfigured()) redirect("/login");
  const { user, profile } = await getSessionSafe();
  if (!user) redirect("/login");
  if (profile?.role !== "academy") redirect("/");
  const params = await searchParams;
  const supabase = await createClient();

  const { data: academy } = await supabase
    .from("academy_profiles")
    .select("id, name, description, logo_url, partner_cafe_ids, instructors")
    .eq("id", user.id)
    .maybeSingle();
  if (!academy) redirect("/onboarding/academy");

  const partnerIds = academy.partner_cafe_ids ?? [];
  const [{ data: cafes }, { data: issues }] = await Promise.all([
    supabase.from("cafes").select("id, name, location").eq("is_active", true).order("name").limit(200),
    supabase.from("certificate_issues").select("id, label, barista_id, created_at").eq("issuer_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);
  const byId = new Map((cafes ?? []).map((c) => [c.id, c]));
  const partners = partnerIds.map((id) => byId.get(id)).filter(Boolean);

  const q = (params?.q ?? "").toString().trim();
  let results = [];
  if (q) {
    const { data } = await supabase
      .from("baristas_public")
      .select("id, full_name, profile_picture_url, location_place")
      .ilike("full_name", `%${q}%`)
      .limit(8);
    results = data ?? [];
  }
  const issueIds = (issues ?? []).map((i) => i.barista_id);
  let issueNames = {};
  if (issueIds.length) {
    const { data } = await supabase.from("baristas_public").select("id, full_name").in("id", [...new Set(issueIds)]);
    issueNames = Object.fromEntries((data ?? []).map((b) => [b.id, b.full_name]));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-caramel uppercase">
        <GraduationCap size={14} /> Academy
      </p>
      <div className="mt-1 flex items-center gap-3">
        <Avatar src={academy.logo_url} name={academy.name} size="md" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-extrabold text-espresso">{academy.name}</h1>
          {academy.description && <p className="mt-0.5 line-clamp-2 text-xs text-espresso-soft">{academy.description}</p>}
        </div>
        <Link href="/dashboard/academy/profile" className="shrink-0 text-xs font-bold text-caramel hover:underline">
          Edit profil →
        </Link>
      </div>

      <section className="mt-6 rounded-2xl card-dark p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
          <Store size={14} /> Kafe partner ({partners.length})
        </h2>
        <p className="mt-0.5 text-xs text-espresso-soft">Kafe yang bekerja sama — lulusannya bisa langsung dipekerjakan.</p>
        <div className="mt-3">
          <PartnerManager academyId={academy.id} partners={partners} cafes={cafes ?? []} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl card-dark p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
          <GraduationCap size={14} /> Instruktur
        </h2>
        <p className="mt-0.5 text-xs text-espresso-soft">Tampilkan siapa yang mengajar + kredensialnya.</p>
        <div className="mt-3">
          <InstructorManager academyId={academy.id} initial={academy.instructors ?? []} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl card-dark p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
          <Award size={14} /> Terbitkan sertifikat
        </h2>
        <p className="mt-0.5 text-xs text-espresso-soft">Ke barista mana saja — termasuk lulusan lama yang baru daftar.</p>
        <form action="/dashboard/academy" method="GET" className="mt-3 flex items-center gap-2">
          <label htmlFor="issue-q" className="sr-only">Cari barista</label>
          <input
            id="issue-q"
            name="q"
            defaultValue={q}
            placeholder="Cari nama barista..."
            autoComplete="off"
            className="h-9 min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-white px-3 text-xs text-espresso outline-none placeholder:text-[#b6a98f] focus:border-coffee"
          />
          <button type="submit" className="inline-flex h-9 shrink-0 items-center rounded-full bg-coffee px-4 text-[11px] font-bold text-white hover:bg-[#2e2015]">
            Cari
          </button>
        </form>
        {q && (
          <ul className="mt-3 space-y-2">
            {results.length === 0 && <li className="text-xs text-espresso-soft">Tidak ketemu. Coba kata kunci lain.</li>}
            {results.map((b) => (
              <li key={b.id} className="flex items-center gap-2 rounded-xl border border-[#e8e0cf] bg-white px-3 py-2">
                <Avatar src={b.profile_picture_url} name={b.full_name} size="sm" />
                <span className="min-w-0 flex-1 truncate text-xs">
                  <span className="font-bold text-espresso">{b.full_name}</span>
                  {b.location_place && <span className="text-espresso-soft"> · {b.location_place}</span>}
                </span>
                <IssueCertButton baristaId={b.id} name={b.full_name} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl card-dark p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-espresso">
          <History size={14} /> Riwayat penerbitan
        </h2>
        {(issues ?? []).length === 0 ? (
          <div className="mt-2">
            <EmptyState title="Belum ada" subtitle="Sertifikat yang kamu terbitkan tercatat di sini." />
          </div>
        ) : (
          <ul className="mt-2 space-y-1.5 text-xs">
            {(issues ?? []).map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#e8e0cf] bg-white px-3 py-2">
                <span className="min-w-0 truncate text-espresso">
                  <span className="font-bold">{i.label}</span>
                  <span className="text-espresso-soft"> → {issueNames[i.barista_id] ?? "Barista"}</span>
                </span>
                <span className="shrink-0 text-[11px] text-espresso-soft">{new Date(i.created_at).toLocaleDateString("id-ID")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
