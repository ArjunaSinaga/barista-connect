import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import BusinessForm from "@/components/owner/BusinessForm";

export const metadata = { title: "Data Bisnis" };

export default async function OwnerProfilePage() {
  const { user } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("owners")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return <BusinessForm initial={row ?? null} />;
}
