import { notFound } from "next/navigation";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import JobPostForm from "@/components/jobs/JobPostForm";

export const metadata = { title: "Edit Lowongan" };

export default async function EditJobPage({ params }) {
  const { id } = await params;
  const { user } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("job_posts")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!job) notFound();

  return (
    <div>
      <div className="mx-auto max-w-4xl px-4 pt-8">
        <h1 className="text-2xl font-extrabold text-espresso">
          Edit Lowongan
        </h1>
      </div>
      <JobPostForm initial={job} />
    </div>
  );
}
