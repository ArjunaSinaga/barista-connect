import { createClient } from "@/lib/supabase/server";

// Fetch trending with auto fallback chain, 100% auto without user input
// Uses tikwm feed/list with region + detail fetch (1 req/sec limit)
export async function fetchTrendingSound() {
  const tries = [
    async () => {
      // ID trending for daily life dance relevance
      const r = await fetch("https://www.tikwm.com/api/feed/list?count=10&region=ID", { headers: { "User-Agent": "Mozilla/5.0" } });
      const j = await r.json().catch(() => ({}));
      const list = j?.data || [];
      // prefer dance-titled
      let pick = list.find((x) => /dance|dancing|tiktok|viral|fyp/i.test(x.title || "")) || list[0];
      if (!pick?.video_id) throw new Error("no video_id");
      await new Promise((res) => setTimeout(res, 1100)); // respect 1 req/sec
      const d = await fetch(`https://www.tikwm.com/api/?url=https://www.tiktok.com/@a/video/${pick.video_id}&hd=1`, { headers: { "User-Agent": "Mozilla/5.0" } });
      const jd = await d.json().catch(() => ({}));
      const data = jd?.data;
      if (!data?.play) throw new Error("no play");
      return {
        sound_url: data.music || data.music_info?.play,
        video_url: data.hdplay || data.play,
        hashtag: (data.title?.match(/#\w+/g) || ["#dance", "#fyp"]).slice(0,3).join(" ") || "#dance #fyp",
        title: data.music_info?.title || data.title?.slice(0,60) || "trending",
        source: "tikwm",
        video_id: pick.video_id,
      };
    },
    async () => {
      // fallback US region
      const r = await fetch("https://www.tikwm.com/api/feed/list?count=10&region=US", { headers: { "User-Agent": "Mozilla/5.0" } });
      const j = await r.json().catch(() => ({}));
      const pick = j?.data?.[0];
      if (!pick?.video_id) throw new Error("no video_id US");
      await new Promise((res) => setTimeout(res, 1100));
      const d = await fetch(`https://www.tikwm.com/api/?url=https://www.tiktok.com/@a/video/${pick.video_id}&hd=1`, { headers: { "User-Agent": "Mozilla/5.0" } });
      const jd = await d.json().catch(() => ({}));
      if (!jd?.data?.play) throw new Error("no play US");
      return { sound_url: jd.data.music, video_url: jd.data.hdplay || jd.data.play, hashtag: "#dance #fyp", title: jd.data.music_info?.title || "trending US", source: "tikwm-US" };
    },
    async () => null,
  ];
  for (const fn of tries) {
    try {
      const res = await fn();
      if (res) return res;
    } catch {}
  }
  // DB fallback
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("influencer_trending_sounds").select("*").eq("is_active", true).limit(10);
    if (data?.length) {
      const pick = data[Math.floor(Math.random() * data.length)];
      return { sound_url: pick.sound_url, video_url: pick.video_url, hashtag: pick.hashtag, title: pick.title, source: "fallback_db", id: pick.id };
    }
  } catch {}
  return { sound_url: null, video_url: null, hashtag: "#dance #dailylife #fyp", title: "fallback", source: "hard_fallback" };
}

export function dailyTheme(date = new Date()) {
  const themes = [
    "dancing in bedroom daily life, viral tiktok dance, natural light, cozy room",
    "dancing in living room daily life, casual outfit, morning routine",
    "dancing daily life content, mirror selfie dance, aesthetic background",
    "dancing in kitchen daily life, casual dance, natural light",
    "dancing daily life vlog, bedroom, viral dance challenge",
    "dancing everyday life, cozy home, trending dance",
  ];
  const idx = date.getDate() % themes.length;
  return themes[idx];
}
