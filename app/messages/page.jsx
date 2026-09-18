import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import ConversationDeleteButton from "@/components/chat/ConversationDeleteButton";

export const metadata = { title: "Pesan" };

export default async function InboxPage({ searchParams }) {
  const params = await searchParams;
  const jobFilter = (params?.job ?? "").toString();
  const { user, profile } = await getSessionSafe();
  if (!isSupabaseConfigured() || !user) return null;
  const isOwner = profile?.role === "owner";

  const supabase = await createClient();
  const { data: convRows } = await supabase
    .from("conversations")
    .select("id, owner_id, barista_id, needs_human, job_post_id, job_posts ( title )")
    .or(`owner_id.eq.${user.id},barista_id.eq.${user.id}`)
    .order("created_at", { ascending: false });
  const { attachConversationNames } = await import("@/lib/publicProfiles");
  let convs = await attachConversationNames(convRows ?? [], supabase);
  // ponytail: opsi filter dari loker yang memang ada di percakapan — tanpa query tambahan
  const jobOpts = [...new Map((convs ?? []).filter((c) => c.job_post_id).map((c) => [c.job_post_id, c.job_posts?.title ?? "Loker"])).entries()];
  if (jobFilter) convs = (convs ?? []).filter((c) => c.job_post_id === jobFilter);

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
      <p className="mt-1 mb-4 text-sm text-espresso-soft">
        Percakapan kamu dengan{" "}
        {isOwner ? "barista" : "pemilik coffee shop"}.
      </p>

      {jobOpts.length > 1 && (
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          <Link
            href="/messages"
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${!jobFilter ? "bg-[#3d2c1e] text-white" : "border border-latte bg-white text-espresso-soft"}`}
          >
            Semua
          </Link>
          {jobOpts.map(([id, title]) => (
            <Link
              key={id}
              href={`/messages?job=${id}`}
              className={`max-w-44 shrink-0 truncate rounded-full px-3 py-1.5 text-[11px] font-bold ${jobFilter === id ? "bg-[#3d2c1e] text-white" : "border border-latte bg-white text-espresso-soft"}`}
            >
              {title}
            </Link>
          ))}
        </div>
      )}

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
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-2xl card-dark p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link
                href={`/messages/${c.id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <Avatar src={counterpart.avatar} name={counterpart.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-bold text-espresso">
                      {counterpart.name}
                    </p>
                    {c.needs_human && (
                      <Badge classes="bg-caramel/10 text-caramel">butuh kamu</Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-espresso-soft">
                    {last
                      ? `${last.is_ai ? "[AI] " : ""}${last.body}`
                      : "Belum ada pesan — mulai ngobrol!"}
                  </p>
                  {c.job_posts?.title && (
                    <p className="mt-0.5 truncate text-[10px] font-bold text-caramel">
                      💼 {c.job_posts.title}
                    </p>
                  )}
                </div>
              </Link>
              <ConversationDeleteButton conversationId={c.id} name={counterpart.name} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
