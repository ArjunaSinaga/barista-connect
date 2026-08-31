import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    // ponytail: fail-fast for Netlify missing env — surface to UI instead of silent fetch failure
    throw new Error("Supabase env belum terpasang. Set NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di Netlify → Site settings → Environment variables lalu redeploy.");
  }
  return createBrowserClient(url, anon);
}
