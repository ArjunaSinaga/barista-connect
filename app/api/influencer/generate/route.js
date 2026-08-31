import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callLLM } from "@/lib/ai";
import { generatePollinations, buildPrompt } from "@/lib/influencer/pollinations";
import { generateGeminiImage } from "@/lib/influencer/geminiImage";
import { swapFace } from "@/lib/influencer/faceswap";
import { fetchTrendingSound, dailyTheme } from "@/lib/influencer/trending";
import { generateVideo } from "@/lib/influencer/video";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authCron(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const hdr = req.headers.get("authorization") || "";
  return hdr === `Bearer ${cronSecret}`;
}

export async function POST(req) {
  if (!authCron(req) && req.headers.get("x-cron") !== "1") {
    // allow authenticated users too
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { type = "foto", theme: themeOverride } = await req.json().catch(() => ({}));
  const supabase = await createClient();
  const { data: chars } = await supabase.from("influencer_characters").select("*").eq("is_active", true).limit(1);
  const char = chars?.[0];
  if (!char) return NextResponse.json({ error: "no character, set face_ref_url first" }, { status: 400 });

  const theme = themeOverride || dailyTheme();
  const basePrompt = char.base_prompt;
  const prompt = buildPrompt(basePrompt, theme);
  const seed = char.seed + new Date().getDate();

  // trending
  const trending = await fetchTrendingSound().catch(() => ({ hashtag: "#gymtok" }));
  // caption via LLM
  let caption = "";
  let hashtags = [];
  try {
    const cap = await callLLM(
      "Kamu copywriter gym girl influencer. Tulis caption IG pendek 20-30 kata, fun, emoji 1-2, CTA.",
      `Tema: ${theme}. Hashtag trending: ${trending.hashtag}. Buat caption + 5 hashtag. Format JSON: {"caption":"...","hashtags":["#..."]}`
    );
    const j = JSON.parse(cap.match(/\{[\s\S]*\}/)?.[0] || "{}");
    caption = j.caption || cap.slice(0, 200);
    hashtags = j.hashtags || [trending.hashtag, "#gymgirl", "#fitgirl"];
  } catch {
    caption = `${theme} 💪 Stay fit, stay fierce!`;
    hashtags = [trending.hashtag || "#gymtok", "#gymgirl", "#fitgirl"];
  }

  // Create post row
  const { data: post, error: pe } = await supabase.from("influencer_posts").insert({
    character_id: char.id,
    type,
    prompt,
    caption,
    hashtags,
    status: "generating",
  }).select().single();
  if (pe) return NextResponse.json({ error: pe.message }, { status: 500 });

  // Dual generation
  let pollRes = null, gemRes = null, pollErr = null, gemErr = null;
  try { pollRes = await generatePollinations({ prompt, seed }); } catch (e) { pollErr = e.message; }
  try { gemRes = await generateGeminiImage({ prompt, referenceImageUrl: char.face_ref_url }); } catch (e) { gemErr = e.message; }

  // Face swap for 100% consistency (if face_ref_url set)
  let finalBuffer = pollRes?.buffer || gemRes?.buffer;
  let finalCT = pollRes?.contentType || gemRes?.contentType || "image/jpeg";
  let faceSwapped = false;
  if (char.face_ref_url && (pollRes?.url || gemRes?.buffer)) {
    // Prefer pollinations url for swap (public), else skip swap if only buffer
    const targetUrl = pollRes?.url || null;
    const swap = await swapFace({ targetUrl, faceRefUrl: char.face_ref_url, targetBuffer: finalBuffer, contentType: finalCT });
    if (swap.swapped && swap.buffer) { finalBuffer = swap.buffer; finalCT = swap.contentType; faceSwapped = true; }
  }

  // If video requested, generate video from final image
  let videoRes = null, videoErr = null, videoPublicUrl = null, videoPath = null;
  if (type === "video" && finalBuffer) {
    try {
      videoRes = await generateVideo({ imageBuffer: finalBuffer, imageUrl: pollRes?.url, prompt: prompt + ", dancing viral tiktok" });
      const vp = `posts/${post.id}-video.mp4`;
      const vu = await supabase.storage.from("influencer").upload(vp, videoRes.buffer, { contentType: "video/mp4", upsert: true });
      if (!vu.error) {
        videoPath = vp;
        const { data } = supabase.storage.from("influencer").getPublicUrl(vp);
        videoPublicUrl = data.publicUrl;
      }
    } catch (e) { videoErr = e.message; }
  }

  // Upload to Supabase storage influencer/
  let storagePath = null, publicUrl = null;
  if (finalBuffer) {
    const ext = type === "video" && videoPublicUrl ? "jpg" : "jpg";
    const path = `posts/${post.id}-final.${ext}`;
    const up = await supabase.storage.from("influencer").upload(path, finalBuffer, { contentType: finalCT, upsert: true });
    if (!up.error) {
      storagePath = path;
      const { data } = supabase.storage.from("influencer").getPublicUrl(path);
      publicUrl = data.publicUrl;
    }
  }
  // Also upload variants for compare (if storage ok)
  if (pollRes?.buffer) {
    const p = `posts/${post.id}-pollinations.jpg`;
    await supabase.storage.from("influencer").upload(p, pollRes.buffer, { contentType: pollRes.contentType, upsert: true }).catch(() => {});
  }
  if (gemRes?.buffer) {
    const p = `posts/${post.id}-gemini.jpg`;
    await supabase.storage.from("influencer").upload(p, gemRes.buffer, { contentType: gemRes.contentType, upsert: true }).catch(() => {});
  }

  const geminiUrl = gemRes ? `posts/${post.id}-gemini.jpg` : null;
  const pollUrl = pollRes ? `posts/${post.id}-pollinations.jpg` : null;
  const finalUrl = videoPublicUrl || publicUrl;

  await supabase.from("influencer_posts").update({
    status: finalUrl ? "ready" : "failed",
    gemini_url: geminiUrl,
    pollinations_url: pollUrl,
    final_url: finalUrl || publicUrl,
    storage_path: videoPath || storagePath,
    error: !finalUrl ? `poll:${pollErr||"ok"} gem:${gemErr||"ok"} video:${videoErr||"ok"}` : (videoErr ? `video:${videoErr}` : null),
  }).eq("id", post.id);

  if (finalUrl) {
    await supabase.from("influencer_assets").insert([
      ...(pollRes ? [{ post_id: post.id, url: pollUrl, storage_path: pollUrl, kind: "pollinations", provider: "pollinations" }] : []),
      ...(gemRes ? [{ post_id: post.id, url: geminiUrl, storage_path: geminiUrl, kind: "gemini", provider: "gemini" }] : []),
      { post_id: post.id, url: finalUrl, storage_path: videoPath || storagePath, kind: type === "video" ? "video_kenburns" : "final", provider: videoRes ? "video" : (faceSwapped ? "faceswap" : "direct") },
    ]);
  }

  return NextResponse.json({ postId: post.id, prompt, caption, hashtags, publicUrl: finalUrl, pollinationsUrl: pollUrl, geminiUrl, faceSwapped, videoUrl: videoPublicUrl, errors: { pollErr, gemErr, videoErr } });
}
