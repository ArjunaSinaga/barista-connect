import { getSessionSafe } from "@/lib/supabase/server";
import JobFeed from "@/components/jobs/JobFeed";

export const metadata = { title: "Cari Lowongan" };

export default async function BaristaDashboardPage() {
  const { profile } = await getSessionSafe();
  return <JobFeed myRole={profile?.role ?? null} />;
}
