import Link from "next/link";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import ApplicantsBoard from "@/components/owner/ApplicantsBoard";
import JobDeleteButton from "@/components/jobs/JobDeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { UsersRound } from "lucide-react";
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
  if (!job) {
    // Bukan 404 misterius: lowongan tidak ada / sudah dihapus / milik akun lain
    const { data: anyJob } = await supabase
      .from("job_posts")
      .select("id, owner_id")
      .eq("id", id)
      .maybeSingle();
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          icon={<UsersRound size={22} />}
          title={anyJob ? "Bukan lowonganmu" : "Lowongan tidak ditemukan"}
          subtitle={
            anyJob
              ? "Lowongan ini milik akun owner lain. Login dengan akun yang membuatnya (mis. owner.senja vs owner.brewok)."
              : "Lowongan ini sudah dihapus atau ID-nya salah. Cek daftar lowongan di dashboard."
          }
          actionLabel="Ke Dashboard"
          actionHref="/dashboard/owner"
        />
      </div>
    );
  }

  // Mark pending applications as viewed (owner opened the list)
  await supabase
    .from("applications")
    .update({ status: "viewed" })
    .eq("job_post_id", job.id)
    .eq("status", "pending");

  const { data: apps } = await supabase
    .from("applications")
    .select(
      `id, status, message, cover_letter, cv_url, employment_types, created_at,
       barista_profiles ( id, full_name, age, location_place,
                          profile_picture_url, years_of_experience, skills,
                          is_open_to_work, whatsapp )`
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
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/owner/jobs/${job.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-full border border-latte px-4 py-2 text-xs font-bold text-espresso hover:border-caramel"
          >
            Edit Lowongan
          </Link>
          <JobDeleteButton jobId={job.id} jobTitle={job.title} variant="button" />
        </div>
      </div>
      <ApplicantsBoard
        jobId={job.id}
        ownerId={user.id}
        initialApplicants={apps ?? []}
      />
    </div>
  );
}
