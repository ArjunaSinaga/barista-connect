import { getSessionSafe } from "@/lib/supabase/server";
import BaristaDirectory from "@/components/search/BaristaDirectory";

export const metadata = { title: "Cari Barista" };

export default async function FindBaristasPage() {
  const { user } = await getSessionSafe();
  // Public preview: anon can browse ("lihat dulu"), actions redirect to login/signup.
  return <BaristaDirectory ownerId={user?.id ?? null} />;
}
