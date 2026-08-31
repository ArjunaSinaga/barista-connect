import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from("influencer_characters").select("*").order("created_at", { ascending: false }).limit(1);
  return NextResponse.json({ character: data?.[0] || null });
}

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { name, base_prompt, negative_prompt, seed, face_ref_url, base_image_url } = body;
  if (!face_ref_url) return NextResponse.json({ error: "face_ref_url required for 100% consistency" }, { status: 400 });
  const { data, error } = await supabase.from("influencer_characters").insert({
    name: name || "Gym Girl",
    base_prompt: base_prompt || "fit gym girl, athletic body, ponytail, photoreal, sharp focus, 9:16 portrait, gym background",
    negative_prompt: negative_prompt || "blurry, deformed, extra limbs",
    seed: Number(seed) || 12345,
    face_ref_url,
    base_image_url: base_image_url || face_ref_url,
    is_active: true,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // deactivate old
  await supabase.from("influencer_characters").update({ is_active: false }).neq("id", data.id);
  await supabase.from("influencer_characters").update({ is_active: true }).eq("id", data.id);
  return NextResponse.json({ character: data });
}
