// ponytail: 100% face lock via InsightFace inswapper_128 on HF Space (free 5min/day)
// Uses Gradio API for HF Space - no extra dep, just fetch
// HF Space: Dentro/face-swap (gradio) - POST /api/predict style

const FACE_SWAP_SPACE = process.env.FACE_SWAP_SPACE || "https://dentro-face-swap.hf.space";
const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || "";

async function callGradioSwap(targetUrl, sourceUrl) {
  // Gradio queue: POST /gradio_api/call/predict -> GET result
  // Fallback to simple POST /api/predict for older gradio
  const headers = { "Content-Type": "application/json" };
  if (HF_TOKEN) headers.Authorization = `Bearer ${HF_TOKEN}`;
  // Step 1: queue
  const q = await fetch(`${FACE_SWAP_SPACE}/gradio_api/call/predict`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: [targetUrl, sourceUrl], fn_index: 0 }),
  });
  if (!q.ok) {
    // fallback: try /api/predict
    const q2 = await fetch(`${FACE_SWAP_SPACE}/api/predict`, {
      method: "POST",
      headers,
      body: JSON.stringify({ data: [targetUrl, sourceUrl], fn_index: 0 }),
    });
    if (!q2.ok) throw new Error(`FaceSwap queue ${q.status}/${q2.status}`);
    const j2 = await q2.json().catch(() => ({}));
    const out = j2?.data?.[0];
    if (!out) throw new Error("FaceSwap no output");
    return out;
  }
  const qj = await q.json().catch(() => ({}));
  const eventId = qj?.event_id;
  if (!eventId) throw new Error("FaceSwap no event_id");
  // Step 2: poll result
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const r = await fetch(`${FACE_SWAP_SPACE}/gradio_api/call/predict/${eventId}`, { headers });
    if (!r.ok) continue;
    const txt = await r.text();
    // gradio streams event: data: [...]
    const m = txt.match(/"data":\s*\[([^\]]+)/);
    if (m) {
      const j = JSON.parse(`[${m[1]}]`);
      // first element is file url or base64
      const out = j[0];
      if (typeof out === "string" && out) return out;
      if (out?.url) return out.url;
    }
    if (txt.includes("COMPLETE")) {
      const j = JSON.parse(txt.split("\n").filter((l) => l.startsWith("data: ")).pop()?.slice(6) || "{}");
      if (j?.data?.[0]) return j.data[0];
    }
  }
  throw new Error("FaceSwap timeout");
}

export async function swapFace({ targetUrl, faceRefUrl, targetBuffer, contentType }) {
  // If we have targetBuffer but no url, upload temp to get url is needed for HF Space
  // For MVP: if targetUrl provided, use it directly; else skip swap and return original
  if (!faceRefUrl) return { url: targetUrl, buffer: targetBuffer, swapped: false };
  if (!targetUrl) {
    // Without public url, HF space can't fetch - return original without swap
    // ponytail: self-host FaceFusion on Railway when HF quota blocks >3/day
    return { url: null, buffer: targetBuffer, contentType, swapped: false, reason: "no public url for swap" };
  }
  try {
    const swappedUrl = await callGradioSwap(targetUrl, faceRefUrl);
    // Fetch swapped image
    const fullUrl = swappedUrl.startsWith("http") ? swappedUrl : `${FACE_SWAP_SPACE}/file=${swappedUrl}`;
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error(`swap fetch ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") || "image/jpeg";
    return { url: fullUrl, buffer: buf, contentType: ct, swapped: true };
  } catch (e) {
    // fallback: return original without swap, log reason
    return { url: targetUrl, buffer: targetBuffer, contentType, swapped: false, error: e.message };
  }
}
