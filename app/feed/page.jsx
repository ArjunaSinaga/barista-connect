import Link from "next/link";
import { createClient, getSessionSafe } from "@/lib/supabase/server";
import Avatar from "@/components/ui/Avatar";
import PostComposer from "@/components/social/PostComposer";

export const revalidate = 30; // feed cache 30 detik

export function generateMetadata() {
  return { title: "Feed Barista — kerja.inc" };
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

export default async function FeedPage() {
  const supabase = await createClient();
  const { user, profile } = await getSessionSafe();
  const isBarista = profile?.role === "barista";

  const { data: posts } = await supabase
    .from("barista_posts")
    .select("id, barista_id, image_url, caption, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  const ids = [...new Set((posts ?? []).map((p) => p.barista_id))];
  const { data: authors } = ids.length
    ? await supabase.from("baristas_public").select("id, full_name, profile_picture_url").in("id", ids)
    : { data: [] };
  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-black text-espresso">Feed Barista</h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Kreasi dan cerita dari barista — terlihat publik, siapa pun bisa melihat.
      </p>

      {isBarista && (
        <div className="mt-4">
          <PostComposer />
        </div>
      )}

      <div className="mt-4 space-y-4">
        {(posts ?? []).map((p) => {
          const a = authorMap.get(p.barista_id);
          return (
            <article key={p.id} className="overflow-hidden rounded-2xl card-dark">
              <div className="flex items-center gap-3 px-5 pt-4">
                <Avatar src={a?.profile_picture_url} name={a?.full_name ?? "?"} size="md" />
                <div className="min-w-0">
                  <Link href={`/barista/${p.barista_id}`} className="block truncate text-sm font-bold text-espresso hover:text-caramel hover:underline">
                    {a?.full_name ?? "Barista"}
                  </Link>
                  <p className="text-xs text-espresso-soft">{timeAgo(p.created_at)}</p>
                </div>
              </div>
              {p.caption && (
                <p className="px-5 pt-3 text-sm leading-relaxed whitespace-pre-line text-espresso">{p.caption}</p>
              )}
              {p.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" loading="lazy" className="mt-3 max-h-[480px] w-full object-cover" />
              )}
              <div className="h-4" />
            </article>
          );
        })}
        {(!posts || posts.length === 0) && (
          <div className="rounded-2xl card-dark p-8 text-center">
            <p className="text-sm font-bold text-espresso">Feed masih kosong</p>
            <p className="mt-1 text-xs text-espresso-soft">
              {isBarista ? "Jadilah yang pertama posting kreasi terbaikmu." : "Segera ada postingan dari para barista."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
