import { Suspense } from "react";
import { getSessionSafe } from "@/lib/supabase/server";
import JobFeed from "@/components/jobs/JobFeed";

export const metadata = { title: "Lowongan Barista" };

export default async function JobsPage() {
  const { profile } = await getSessionSafe();
  return (
    <Suspense>
      <JobFeed myRole={profile?.role ?? null} />
    </Suspense>
  );
}
