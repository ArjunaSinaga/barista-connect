import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Sparkles, Award, BriefcaseBusiness } from "lucide-react";
import { createClient, getSessionSafe } from "@/lib/supabase/server";
import Avatar from "@/components/ui/Avatar";
import StartChatButton from "@/components/chat/StartChatButton";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: "Profil Barista" };
}

export default async function BaristaPublicPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: b } = await supabase
    .from("barista_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!b) notFound();

  const { user, profile } = await getSessionSafe();
  const isSelf = user?.id === b.id;
  const isOwner = profile?.role === "owner";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header card */}
      <div className="overflow-hidden rounded-2xl card-dark shadow-sm">
        <div className="h-24 bg-gradient-to-r from-latte/70 via-cream-dark to-caramel/30 sm:h-28" />
        <div className="-mt-12 px-6 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar
                src={b.profile_picture_url}
                name={b.full_name}
                size="xl"
                className="border-4 border-white shadow-md"
              />
              <div className="pb-1">
                <h1 className="text-2xl font-extrabold text-espresso">
                  {b.full_name}
                </h1>
                <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-espresso-soft">
                  <MapPin size={13} className="text-caramel" />
                  {b.location_place} • {b.age} tahun
                </p>
              </div>
            </div>
            {isOwner && (
              <div className="w-full sm:w-auto">
                <StartChatButton ownerId={user.id} baristaId={b.id} />
              </div>
            )}
            {isSelf && (
              <Link
                href="/dashboard/barista/profile"
                className="rounded-xl bg-espresso px-4 py-2.5 text-sm font-bold text-white hover:bg-espresso/90"
              >
                Edit profil
              </Link>
            )}
          </div>

          <div
            className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${
              b.is_open_to_work
                ? "bg-matcha/15 text-matcha"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${b.is_open_to_work ? "bg-matcha pulse-dot" : "bg-gray-400"}`}
            />
            {b.is_open_to_work
              ? "Terbuka untuk peluang kerja"
              : "Sedang tidak mencari kerja"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard icon={<BriefcaseBusiness size={16} />} label="Pengalaman" value={`${b.years_of_experience} tahun`} />
        <StatCard icon={<BadgeCheck size={16} />} label="Skill" value={`${b.skills?.length ?? 0}`} />
        <StatCard icon={<Award size={16} />} label="Sertifikat" value={`${b.certificates?.length ?? 0}`} />
      </div>

      {/* Skills */}
      {b.skills?.length > 0 && (
        <section className="mt-4 rounded-2xl card-dark p-6">
          <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">
            Keahlian
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {b.skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-caramel/10 px-3 py-1.5 text-xs font-bold text-caramel"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certificates */}
      {b.certificates?.length > 0 && (
        <section className="mt-4 rounded-2xl card-dark p-6">
          <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">
            Sertifikat
          </h2>
          <ul className="mt-3 space-y-2">
            {b.certificates.map((c, i) => (
              <li
                key={`${c}-${i}`}
                className="flex items-center gap-2.5 rounded-xl bg-cream px-4 py-3 text-sm font-semibold text-espresso"
              >
                <Award size={15} className="shrink-0 text-caramel" />
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ideas+ */}
      {b.ideas_plus && (
        <section className="mt-4 rounded-2xl border border-caramel/25 bg-caramel/5 p-6">
          <h2 className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-caramel uppercase">
            <Sparkles size={14} /> Ide & nilai plus
          </h2>
          <p className="mt-3 leading-relaxed text-espresso italic">
            “{b.ideas_plus}”
          </p>
        </section>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl card-dark p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-dark text-caramel">
        {icon}
      </span>
      <div>
        <p className="text-lg leading-none font-extrabold text-espresso">
          {value}
        </p>
        <p className="mt-1 text-[10px] font-bold tracking-wide text-espresso-soft uppercase">
          {label}
        </p>
      </div>
    </div>
  );
}
