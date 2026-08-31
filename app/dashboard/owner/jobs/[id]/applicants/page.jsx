import { notFound } from "next/navigation";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import ApplicantsBoard from "@/components/owner/ApplicantsBoard";
import { relativeTime } from "@/lib/time";

export const metadata = { title: "Pelamar" };

export default async function ApplicantsPage({ params }) {
  const { id } = await params;
  const { user } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;
  const supabase = await createClient();

  // Job must belong to this owner
  const { data: job } = await supabase
    .from("job_posts")
    .select("id, title, is_active")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!job) notFound();

  // Mark pending applications as viewed (owner opened the list)
  await supabase
    .from("applications")
    .update({ status: "viewed" })
    .eq("job_post_id", job.id)
    .eq("status", "pending");

  const { data: apps } = await supabase
    .from("applications")
    .select(
      `id, status, message, created_at,
       barista_profiles ( id, full_name, age, location_place,
                          profile_picture_url, years_of_experience, skills,
                          is_open_to_work )`
    )
    .eq("job_post_id", job.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <p className="text-xs font-bold tracking-wide text-espresso-soft uppercase">
          Lowongan:{" "}
          <span className="text-caramel">{job.title}</span>{" "}
          {!job.is_active && "(dijeda)"}
        </p>
      </div>
      <ApplicantsBoard
        jobId={job.id}
        ownerId={user.id}
        initialApplicants={apps ?? []}
      />
    </div>
  );
}
