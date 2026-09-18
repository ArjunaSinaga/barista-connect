import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSessionSafe } from "@/lib/supabase/server";
import ApplicationsList from "@/components/barista/ApplicationsList";

export const metadata = { title: "Lamaran Saya" };

export default async function ApplicationsPage() {
  const { profile } = await getSessionSafe();
  if (profile?.role !== "barista") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState icon={<FileText size={22} />} title="Khusus barista" subtitle="Halaman ini hanya untuk akun barista." actionLabel="Ke Dashboard" actionHref="/dashboard/owner" />
      </div>
    );
  }
  return <ApplicationsList />;
}
