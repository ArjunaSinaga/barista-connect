"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import ConnectButton from "@/components/social/ConnectButton";

// Inbox permintaan koneksi masuk (status pending, saya yang dituju).
export default function ConnectionInbox({ viewerId }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!viewerId) return;
    (async () => {
      const supabase = createClient();
      const { data: reqs } = await supabase
        .from("barista_connections")
        .select("id, requester_id, created_at")
        .eq("addressee_id", viewerId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!reqs?.length) { setItems([]); return; }
      const ids = reqs.map((r) => r.requester_id);
      const { data: people } = await supabase
        .from("baristas_public")
        .select("id, full_name, profile_picture_url")
        .in("id", ids);
      const map = new Map((people ?? []).map((p) => [p.id, p]));
      setItems(reqs.map((r) => ({ ...r, person: map.get(r.requester_id) ?? null })));
    })();
  }, [viewerId]);

  if (!items?.length) return null;
  return (
    <section className="mx-auto mb-4 max-w-3xl rounded-2xl card-dark p-5">
      <h2 className="text-xs font-extrabold tracking-wide text-espresso uppercase">
        Permintaan koneksi ({items.length})
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3">
            <Link href={`/barista/${r.requester_id}`} className="flex min-w-0 items-center gap-2.5">
              <Avatar src={r.person?.profile_picture_url} name={r.person?.full_name ?? "?"} size="sm" />
              <span className="truncate text-sm font-bold text-espresso hover:text-caramel hover:underline">
                {r.person?.full_name ?? "Pengguna kerja.inc"}
              </span>
            </Link>
            <ConnectButton targetId={r.requester_id} viewerId={viewerId} />
          </li>
        ))}
      </ul>
    </section>
  );
}
