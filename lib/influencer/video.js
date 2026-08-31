// ponytail: free video via Bytez stable-video-diffusion or HF Space fallback
// KenBurns = simple 5s mp4 from single image (no ffmpeg needed -> use HF Space)

const BYTEZ_URL = "https://api.bytez.com/models/v2";
const HF_VIDEO_SPACE = process.env.HF_VIDEO_SPACE || "https://ali-vilab-text-to-video-ms-1.7b.hf.space";

// Bytez image-to-video (stable-video-diffusion-img2vid-xt) - free tier
export async function generateVideoBytez({ imageBuffer, imageUrl }) {
  const key = process.env.BYTEZ_API_KEY;
  if (!key) throw new Error("BYTEZ_API_KEY missing");
  // bytez expects base64 image for img2vid
  let b64 = "";
  if (imageBuffer) b64 = imageBuffer.toString("base64");
  else if (imageUrl) {
    const r = await fetch(imageUrl);
    if (r.ok) b64 = Buffer.from(await r.arrayBuffer()).toString("base64");
  }
  if (!b64) throw new Error("no image for video");
  const res = await fetch(`${BYTEZ_URL}/stabilityai/stable-video-diffusion-img2vid-xt`, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ image: b64, motion_bucket_id: 127, fps: 6, num_frames: 14 }),
  });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Bytez video ${res.status}: ${t.slice(0,300)}`);
  }
  // bytez returns video/mp4 or json with base64
  if (ct.includes("video")) {
    const buf = Buffer.from(await res.arrayBuffer());
    return { buffer: buf, contentType: "video/mp4" };
  }
  const j = await res.json().catch(() => ({}));
  const b64out = j?.output || j?.video || j?.data;
  if (b64out) return { buffer: Buffer.from(b64out, "base64"), contentType: "video/mp4" };
  throw new Error("Bytez video no output");
}

// Fallback: HF Space video via gradio (always free, no key)
export async function generateVideoHF({ prompt }) {
  // Use text-to-video MS 1.7b space
  const headers = { "Content-Type": "application/json" };
  if (process.env.HF_TOKEN) headers.Authorization = `Bearer ${process.env.HF_TOKEN}`;
  const q = await fetch(`${HF_VIDEO_SPACE}/gradio_api/call/predict`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: [prompt], fn_index: 0 }),
  });
  if (!q.ok) throw new Error(`HF video queue ${q.status}`);
  const { event_id } = await q.json().catch(() => ({}));
  if (!event_id) throw new Error("HF video no event_id");
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const r = await fetch(`${HF_VIDEO_SPACE}/gradio_api/call/predict/${event_id}`, { headers });
    const txt = await r.text().catch(() => "");
    if (txt.includes("video") || txt.includes(".mp4")) {
      const m = txt.match(/https?:[^"]+\.mp4/);
      if (m) {
        const vr = await fetch(m[0]);
        if (vr.ok) return { buffer: Buffer.from(await vr.arrayBuffer()), contentType: "video/mp4", url: m[0] };
      }
    }
  }
  throw new Error("HF video timeout");
}

// Main: try Bytez first, fallback HF, fallback null
export async function generateVideo({ imageBuffer, imageUrl, prompt }) {
  try {
    return await generateVideoBytez({ imageBuffer, imageUrl });
  } catch (e) {
    // ponytail: bytez may be gated, try HF
    try {
      return await generateVideoHF({ prompt: prompt || "gym girl dancing viral tiktok, 9:16" });
    } catch (e2) {
      throw new Error(`video fail bytez:${e.message} hf:${e2.message}`);
    }
  }
}
