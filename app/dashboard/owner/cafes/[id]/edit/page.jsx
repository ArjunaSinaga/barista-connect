import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import CafeForm from "@/components/owner/CafeForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Store } from "lucide-react";

export const metadata = { title: "Edit Cafe" };

export default async function EditCafePage({ params }) {
  const { id } = await params;
  const { user } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;
  const supabase = await createClient();

  const { data: cafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!cafe) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          icon={<Store size={22} />}
          title="Cafe tidak tersedia"
          subtitle="Sudah dihapus atau milik akun lain."
          actionLabel="Ke Cafe Saya"
          actionHref="/dashboard/owner/cafes"
        />
      </div>
    );
  }

  return <CafeForm initial={cafe} />;
}
