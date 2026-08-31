import { notFound } from "next/navigation";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import ProfileEditor from "@/components/barista/ProfileEditor";

export const metadata = { title: "Profil Saya" };

export default async function BaristaProfilePage() {
  const { user } = await getSessionSafe();
  if (!user || !isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("barista_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!row) notFound();
  return <ProfileEditor initial={row} />;
}
