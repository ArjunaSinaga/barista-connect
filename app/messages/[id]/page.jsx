import { notFound } from "next/navigation";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import ChatWindow from "@/components/chat/ChatWindow";

export const metadata = { title: "Percakapan" };

export default async function ThreadPage({ params }) {
  const { id } = await params;
  const { user, profile } = await getSessionSafe();
  if (!isSupabaseConfigured() || !user) return null;

  const supabase = await createClient();
  const isOwner = profile?.role === "owner";

  const { data: conv } = await supabase
    .from("conversations")
    .select(
      `id, owner_id, barista_id,
       owners ( business_name ),
       barista_profiles ( full_name, profile_picture_url ),
       job_posts ( title )`
    )
    .eq("id", id)
    .maybeSingle();

  if (!conv || ![conv.owner_id, conv.barista_id].includes(user.id)) notFound();

  const counterpart = isOwner
    ? {
        name: conv.barista_profiles?.full_name ?? "Barista",
        avatar: conv.barista_profiles?.profile_picture_url,
      }
    : {
        name: conv.owners?.business_name ?? "Coffee Shop",
        avatar: null,
      };

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender_id, body, is_ai, created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <ChatWindow
      conversationId={conv.id}
      meId={user.id}
      counterpartName={counterpart.name}
      counterpartAvatar={counterpart.avatar}
      jobTitle={conv.job_posts?.title ?? null}
      initialMessages={msgs ?? []}
    />
  );
}
