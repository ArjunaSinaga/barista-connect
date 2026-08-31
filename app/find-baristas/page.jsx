import { getSessionSafe } from "@/lib/supabase/server";
import BaristaDirectory from "@/components/search/BaristaDirectory";

export const metadata = { title: "Cari Barista" };

export default async function FindBaristasPage() {
  const { user } = await getSessionSafe();
  if (!user) return null;
  return <BaristaDirectory ownerId={user.id} />;
}
