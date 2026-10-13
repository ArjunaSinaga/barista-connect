import { Suspense } from "react";
import { getSessionSafe } from "@/lib/supabase/server";
import BaristaDirectory from "@/components/search/BaristaDirectory";

export const metadata = { title: "Cari Barista" };

export default async function FindBaristasPage() {
  const { user } = await getSessionSafe();
  // Public preview: anon can browse ("lihat dulu"), actions redirect to login/signup.
  // Tanpa key remount: BaristaDirectory sinkron URL via efek internal (pilihan tidak hilang).
  return (
    <Suspense>
      <BaristaDirectory ownerId={user?.id ?? null} />
    </Suspense>
  );
}
