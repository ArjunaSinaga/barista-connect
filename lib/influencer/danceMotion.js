// Real TikTok dance motion - free via HF Spaces
// Primary: https://huggingface.co/spaces/KwaiVGI/LivePortrait or MimicMotion
// Using gradio API pattern same as faceswap

const MOTION_SPACES = [
  "https://api-modelslab-free.hf.space", // placeholder
  "https://tencentarc-mimic-motion.hf.space",
  "https://kwaivgi-liveportrait.hf.space",
];

// Try HF Space MimicMotion (MusePose) via gradio
export async function generateDanceMotion({ imageUrl, videoUrl }) {
  const hfToken = process.env.HF_TOKEN || "";
  const headers = { "Content-Type": "application/json" };
  if (hfToken) headers.Authorization = `Bearer ${hfToken}`;

  // Try spaces in order
  const spaces = [
    { url: "https://tencentarc-mimic-motion.hf.space", fn: 0, payload: [imageUrl, videoUrl] },
    { url: "https://KwaiVGI-LivePortrait.hf.space", fn: 0, payload: [imageUrl, videoUrl] },
  ];

  let lastErr = "";
  for (const s of spaces) {
    try {
      const q = await fetch(`${s.url}/gradio_api/call/predict`, {
        method: "POST",
        headers,
        body: JSON.stringify({ data: s.payload, fn_index: s.fn }),
      });
      if (!q.ok) { lastErr = `queue ${q.status}`; continue; }
      const { event_id } = await q.json();
      if (!event_id) { lastErr = "no event_id"; continue; }
      for (let i = 0; i < 45; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const r = await fetch(`${s.url}/gradio_api/call/predict/${event_id}`, { headers });
        const txt = await r.text();
        const m = txt.match(/https?:[^"]+\.mp4/);
        if (m) {
          const vr = await fetch(m[0]);
          if (vr.ok) return { buffer: Buffer.from(await vr.arrayBuffer()), contentType: "video/mp4", url: m[0] };
        }
        if (txt.includes("error")) throw new Error(txt.slice(0,300));
      }
      lastErr = "timeout";
    } catch (e) { lastErr = e.message; }
  }
  throw new Error(`dance motion fail: ${lastErr}`);
}

// Fallback: generate dance prompt image + ffmpeg KenBurns with dance caption
export async function generateDanceFallback({ imageBuffer }) {
  // just return same buffer as video placeholder - caller will ffmpeg it
  return { buffer: imageBuffer, contentType: "image/jpeg", isFallback: true };
}
