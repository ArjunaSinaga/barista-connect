import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import JobManageCard from "@/components/jobs/JobManageCard";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Lowongan Saya" };

export default async function OwnerDashboardPage() {
  const { user, profile } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("job_posts")
    .select("*, applications(count)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const list = (jobs ?? []).map((j) => ({
    ...j,
    applicantCount: j.applications?.[0]?.count ?? 0,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-espresso">Lowongan Saya</h1>
          <p className="mt-1 text-sm text-espresso-soft">
            {profile ? "Kelola lowongan dan pantau pelamarnya." : ""}
          </p>
        </div>
        <Link
          href="/dashboard/owner/jobs/new"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-caramel px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-caramel-dark"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Buat</span>
        </Link>
      </div>

      <div className="mt-6 space-y-4 pb-8">
        {list.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={22} />}
            title="Belum ada lowongan"
            subtitle="Pasang lowongan pertama kamu — barista terdekat akan langsung melihatnya."
            actionLabel="Buat Lowongan"
            actionHref="/dashboard/owner/jobs/new"
          />
        ) : (
          list.map((job) => (
            <JobManageCard
              key={job.id}
              job={job}
              applicantCount={job.applicantCount}
            />
          ))
        )}
      </div>
    </div>
  );
}
