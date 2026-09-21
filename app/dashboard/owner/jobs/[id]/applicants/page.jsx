import Link from "next/link";
import { redirect } from "next/navigation";
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
  if (!isSupabaseConfigured() || !user) redirect("/login");
  const supabase = await createClient();

  // Job must belong to this owner (atau manager dalam scope kafe-nya)
  const { data: jobRow } = await supabase
    .from("job_posts")
    .select("id, title, is_active, cafe_id, owner_id")
    .eq("id", id)
    .maybeSingle();
  if (!jobRow) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState icon={<UsersRound size={22} />} title="Lowongan tidak ditemukan" subtitle="Lowongan ini sudah dihapus atau ID-nya salah. Cek daftar lowongan di dashboard." actionLabel="Ke Dashboard" actionHref="/dashboard/owner" />
      </div>
    );
  }
  let allowed = jobRow.owner_id === user.id;
  if (!allowed) {
    const { data: ok } = await supabase.rpc("can_manage_cafe", { c: jobRow.cafe_id });
    allowed = ok === true;
  }
  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          icon={<UsersRound size={22} />}
          title="Bukan lowonganmu"
          subtitle="Lowongan ini milik akun owner lain. Login dengan akun yang membuatnya (mis. owner.senja vs owner.brewok)."
          actionLabel="Ke Dashboard"
          actionHref="/dashboard/owner"
        />
      </div>
    );
  }
  const job = jobRow;

  // Mark pending applications as viewed (owner opened the list)
  const { error: viewedError } = await supabase
    .from("applications")
    .update({ status: "viewed" })
    .eq("job_post_id", job.id)
    .eq("status", "pending");
  const viewedBlocked = Boolean(viewedError);

  const { data: rawApps } = await supabase
    .from("applications")
    .select(
       `id, status, message, cover_letter, cv_url, employment_types, created_at,
        barista_profiles ( id, full_name, age, location_place,
                           profile_picture_url, years_of_experience, experience_months, skills,
                           is_open_to_work, whatsapp )`
    )
    .eq("job_post_id", job.id)
    .order("created_at", { ascending: false });
  // CV privat: signed URL 1 jam per baris (bucket cvs privat, policy cvs_owner_read yg jaga).
  const apps = await Promise.all(
    (rawApps ?? []).map(async (a) => {
      if (!a.cv_url || !a.cv_url.includes("/cvs/")) return a;
      const path = a.cv_url.split("/cvs/")[1].split("?")[0];
      const { data } = await supabase.storage.from("cvs").createSignedUrl(path, 3600);
      return data?.signedUrl ? { ...a, cv_signed: data.signedUrl } : a;
    })
  );

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
        viewedBlocked={viewedBlocked}
      />
    </div>
  );
}
