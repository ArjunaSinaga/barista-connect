import { redirect, notFound } from "next/navigation";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import AccountShell from "@/components/account/AccountShell";

export const metadata = { title: "Akun Saya — Barista Connect" };

export default async function AccountPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const { user, profile } = await getSessionSafe();
  if (!user) redirect("/login");
  if (!profile) redirect("/onboarding");

  const supabase = await createClient();

  if (profile.role === "barista") {
    const { data: barista } = await supabase
      .from("barista_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!barista) redirect("/onboarding/barista");
    return <AccountShell user={user} profile={profile} barista={barista} owner={null} />;
  }

  if (profile.role === "owner") {
    const { data: owner } = await supabase
      .from("owners")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!owner) redirect("/onboarding/owner");
    return <AccountShell user={user} profile={profile} barista={null} owner={owner} />;
  }

  notFound();
}
