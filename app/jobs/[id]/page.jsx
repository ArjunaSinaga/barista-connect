import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Store,
  CalendarClock,
} from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import ApplyButton from "@/components/jobs/ApplyButton";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { relativeTime } from "@/lib/time";

const TYPE_CLASSES = {
  full_time: "bg-caramel/10 text-caramel",
  part_time: "bg-blue-100 text-blue-700",
  casual: "bg-purple-100 text-purple-700",
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) return { title: "Lowongan" };
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("job_posts")
      .select("title, location")
      .eq("id", id)
      .maybeSingle();
    return {
      title: data ? `${data.title} — ${data.location}` : "Lowongan",
    };
  } catch {
    return { title: "Lowongan" };
  }
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;

  const { user, profile } = await getSessionSafe();
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data: job } = await supabase
    .from("job_posts")
    .select("*, owners(business_name, location)")
    .eq("id", id)
    .maybeSingle();

  // Inactive jobs visible only to their owner
  if (!job || (!job.is_active && job.owner_id !== user?.id)) notFound();

  let applied = false;
  let applicationId = null;
  if (profile?.role === "barista") {
    const { data: app } = await supabase
      .from("applications")
      .select("id")
      .eq("job_post_id", job.id)
      .eq("barista_id", user.id)
      .maybeSingle();
    applied = Boolean(app);
    applicationId = app?.id;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-espresso-soft hover:text-caramel"
      >
        <ArrowLeft size={16} /> Semua lowongan
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main */}
        <div>
          <div className="rounded-2xl border border-latte bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-espresso">
                {job.title}
              </h1>
              <Badge classes={TYPE_CLASSES[job.employment_type]}>
                {EMPLOYMENT_LABELS[job.employment_type]}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-semibold text-espresso-soft">
              <span className="flex items-center gap-1.5">
                <Store size={15} className="text-caramel" />
                {job.owners?.business_name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-caramel" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock size={15} className="text-caramel" />
                {relativeTime(job.created_at)}
              </span>
            </div>

            {!job.is_active && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">
                Lowongan ini sedang dinonaktifkan oleh pemilik usaha.
              </p>
            )}

            <div className="mt-6 border-t border-latte/60 pt-6">
              <h2 className="text-sm font-extrabold tracking-wide text-espresso uppercase">
                Deskripsi
              </h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-espresso-soft">
                {job.description || "Belum ada deskripsi."}
              </p>
            </div>
          </div>

          {/* About business */}
          <div className="mt-4 rounded-2xl border border-latte bg-white p-6">
            <h2 className="text-sm font-extrabold tracking-wide text-espresso uppercase">
              Tentang Usaha
            </h2>
            <p className="mt-3 flex items-center gap-2 font-bold text-espresso">
              <Store size={16} className="text-caramel" />
              {job.owners?.business_name}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-espresso-soft">
              <MapPin size={14} /> {job.owners?.location}
            </p>
          </div>
        </div>

        {/* Sticky apply card */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-latte bg-white p-5 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs font-bold text-espresso-soft">
              <Clock size={13} /> Lamar sekarang, gratis
            </p>
            {profile?.role === "barista" ? (
              <div className="mt-4">
                <ApplyButton jobId={job.id} applied={applied} full size="lg" />
                {applied && (
                  <Link
                    href="/dashboard/barista/applications"
                    className="mt-3 block text-center text-xs font-bold text-caramel hover:underline"
                  >
                    Lihat status lamaran →
                  </Link>
                )}
              </div>
            ) : user ? (
              <p className="mt-4 rounded-xl bg-cream-dark px-4 py-3 text-xs font-semibold text-espresso-soft">
                Kamu masuk sebagai pemilik usaha. Hanya akun barista yang bisa
                melamar.
              </p>
            ) : (
              <ApplyButton jobId={job.id} full size="lg" />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
