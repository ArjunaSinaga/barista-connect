import { Suspense } from "react";
import { getSessionSafe } from "@/lib/supabase/server";
import BaristaDirectory from "@/components/search/BaristaDirectory";

export const metadata = { title: "Cari Barista" };

export default async function FindBaristasPage({ searchParams }) {
  const { user } = await getSessionSafe();
  const params = await searchParams;
  // Remount direktori tiap query berubah agar state filter sinkron dengan URL (quick-filter pills).
  const dirKey = JSON.stringify(params ?? {});
  // Public preview: anon can browse ("lihat dulu"), actions redirect to login/signup.
  return (
    <Suspense>
      <BaristaDirectory key={dirKey} ownerId={user?.id ?? null} />
    </Suspense>
  );
}
