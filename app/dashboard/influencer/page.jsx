import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Influencer Auto - Compare" };

export default async function InfluencerPage() {
  const supabase = await createClient();
  const { data: chars } = await supabase.from("influencer_characters").select("*").order("created_at", { ascending: false }).limit(1);
  const char = chars?.[0];
  const { data: posts } = await supabase.from("influencer_posts").select("*").order("created_at", { ascending: false }).limit(12);
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/influencer/` : "";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gym Girl Auto — Dual Compare (Pollinations vs Gemini + Face-Lock 100%)</h1>
      <div className="rounded-xl border p-4 bg-amber-50">
        <p className="text-sm"><b>Karakter aktif:</b> {char?.name || "-"} | seed {char?.seed} | face_ref: {char?.face_ref_url ? "✅ set" : "❌ belum — upload 1 foto wajah depan untuk 100% lock"}</p>
        {char?.face_ref_url && <img src={char.face_ref_url} alt="ref" className="w-24 h-32 object-cover rounded mt-2 border" />}
        <p className="text-xs mt-2 text-zinc-600">Cron: <code>GET /api/cron/influencer</code> (beri header <code>Authorization: Bearer $CRON_SECRET</code>). Generate manual: <code>POST /api/influencer/generate</code> {"{type:'foto'}"}.</p>
      </div>

      <form action="/api/influencer/character" method="post" className="hidden" id="charForm" />
      <div className="flex gap-2">
        <a href="/api/cron/influencer?secret=" className="px-4 py-2 rounded-full bg-black text-white text-sm">Trigger Cron Sekarang</a>
        <span className="text-xs text-zinc-500 py-2">Set FACE_REF_URL dulu via POST /api/influencer/character {"{face_ref_url: 'https://.../ref.jpg'}"} </span>
      </div>

      <div className="grid gap-4">
        {(posts || []).map((p) => (
          <div key={p.id} className="border rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500"><span>{p.type} — {p.status} — {new Date(p.created_at).toLocaleString()}</span><span className="truncate max-w-[50%]">{p.prompt?.slice(0,80)}</span></div>
            <p className="text-sm">{p.caption} <span className="text-sky-600">{(p.hashtags||[]).join(" ")}</span></p>
            <div className="grid grid-cols-3 gap-2">
              <div><p className="text-xs font-semibold">A Pollinations</p>{p.pollinations_url ? (p.type==='video' ? <video src={p.final_url} className="w-full aspect-[9/16] object-cover rounded border" controls muted loop /> : <img src={bucket + p.pollinations_url} alt="A" className="w-full aspect-[9/16] object-cover rounded border" />) : <div className="bg-zinc-100 aspect-[9/16] rounded grid place-items-center text-xs">-</div>}</div>
              <div><p className="text-xs font-semibold">B Gemini</p>{p.gemini_url ? <img src={bucket + p.gemini_url} alt="B" className="w-full aspect-[9/16] object-cover rounded border" /> : <div className="bg-zinc-100 aspect-[9/16] rounded grid place-items-center text-xs">-</div>}</div>
              <div><p className="text-xs font-semibold">Final (face-lock 100%)</p>{p.final_url ? (p.type==='video' ? <video src={p.final_url} className="w-full aspect-[9/16] object-cover rounded border-2 border-green-500" controls muted loop /> : <img src={p.final_url} alt="final" className="w-full aspect-[9/16] object-cover rounded border-2 border-green-500" />) : <div className="bg-zinc-100 aspect-[9/16] rounded grid place-items-center text-xs">{p.error ? "failed" : "generating"}</div>}</div>
            </div>
            {p.error && <p className="text-xs text-red-600">{p.error}</p>}
            <p className="text-xs">IG: {p.ig_media_id || "belum publish"} | storage: {p.storage_path || "-"}</p>
          </div>
        ))}
        {!posts?.length && <p className="text-sm text-zinc-500">Belum ada post. Trigger generate dulu.</p>}
      </div>
    </div>
  );
}
