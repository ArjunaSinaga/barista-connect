import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";

export const metadata = { title: "Pesan" };

export default async function InboxPage() {
  const { user, profile } = await getSessionSafe();
  if (!isSupabaseConfigured() || !user) return null;
  const isOwner = profile?.role === "owner";

  const supabase = await createClient();
  const { data: convs } = await supabase
    .from("conversations")
    .select(
      `id, owner_id, barista_id, needs_human,
       owners ( id, business_name ),
       barista_profiles ( id, full_name, profile_picture_url )`
    )
    .or(`owner_id.eq.${user.id},barista_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // last message per thread
  let lastByConv = {};
  if (convs?.length) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("conversation_id, body, is_ai, created_at")
      .in(
        "conversation_id",
        convs.map((c) => c.id)
      )
      .order("created_at", { ascending: false })
      .limit(200);
    for (const m of msgs ?? []) {
      if (!lastByConv[m.conversation_id]) lastByConv[m.conversation_id] = m;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-espresso">Pesan</h1>
      <p className="mt-1 mb-6 text-sm text-espresso-soft">
        Percakapan kamu dengan{" "}
        {isOwner ? "barista" : "pemilik coffee shop"}.
      </p>

      {(convs ?? []).length === 0 && (
        <EmptyState
          icon={<MessagesSquare size={22} />}
          title="Belum ada percakapan"
          subtitle={
            isOwner
              ? "Mulai chat dari halaman pelamar atau direktori barista."
              : "Hubungi pemilik coffee shop dari detail lowongan."
          }
          actionHref={isOwner ? "/find-baristas" : "/jobs"}
          actionLabel={isOwner ? "Cari Barista" : "Lihat Lowongan"}
        />
      )}

      <div className="space-y-3 pb-10">
        {(convs ?? []).map((c) => {
          const counterpart = isOwner
            ? {
                name:
                  c.barista_profiles?.full_name ?? "Barista",
                avatar: c.barista_profiles?.profile_picture_url,
              }
            : {
                name: c.owners?.business_name ?? "Coffee Shop",
                avatar: null,
              };
          const last = lastByConv[c.id];
          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center gap-4 rounded-2xl card-dark p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <Avatar src={counterpart.avatar} name={counterpart.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold text-espresso">
                    {counterpart.name}
                  </p>
                  {c.needs_human && (
                    <Badge classes="bg-caramel/10 text-caramel">✨ butuh kamu</Badge>
                  )}
                </div>
                <p className="truncate text-xs text-espresso-soft">
                  {last
                    ? `${last.is_ai ? "✨ " : ""}${last.body}`
                    : "Belum ada pesan — mulai ngobrol!"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
