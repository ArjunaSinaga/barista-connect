import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import CafeForm from "@/components/owner/CafeForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Store } from "lucide-react";

export const metadata = { title: "Edit Kafe" };

export default async function EditCafePage({ params }) {
  const { id } = await params;
  const { user } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;
  const supabase = await createClient();

  const { data: kafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  // Pemilik atau manager dalam scope (via RPC, bukan owner_id mentah)
  let allowed = kafe && kafe.owner_id === user.id;
  if (kafe && !allowed) {
    const { data: ok } = await supabase.rpc("can_manage_cafe", { c: id });
    allowed = ok === true;
  }

  if (!kafe || !allowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          icon={<Store size={22} />}
          title="Kafe tidak tersedia"
          subtitle="Sudah dihapus atau milik akun lain."
          actionLabel="Ke Kafe Saya"
          actionHref="/dashboard/owner/cafes"
        />
      </div>
    );
  }

  return <CafeForm initial={kafe} />;
}
