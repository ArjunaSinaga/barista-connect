import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// LP-07: satu titik keputusan "Hire Workers" by state auth/role.
// CTA mana pun yang mau memicu alur hiring cukup link ke /hire.
export default async function HireRedirect() {
  const { user, profile } = await getSessionSafe();
  if (!user) redirect("/register?role=employer");
  if (profile?.role === "owner") redirect("/dashboard/owner/jobs/new");
  redirect("/find-baristas");
}
