// Gemini 2.0 Flash image generation - free 1500/day via GEMINI_API_KEY
// Uses REST generateContent with image generation capability
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash";

export async function generateGeminiImage({ prompt, referenceImageUrl, width = 768, height = 1360 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${key}`;
  // Gemini image gen expects parts with text + optional inline_data for reference
  const parts = [{ text: `${prompt} -- aspect 9:16 -- resolution ${width}x${height}, photoreal` }];
  // If reference provided, add as image part (fetch and base64)
  if (referenceImageUrl) {
    try {
      const r = await fetch(referenceImageUrl);
      if (r.ok) {
        const buf = await r.arrayBuffer();
        const b64 = Buffer.from(buf).toString("base64");
        parts.unshift({ inline_data: { mime_type: "image/jpeg", data: b64 } });
        parts[1].text = `Same person as reference image, keep face identity 100%, ${parts[1].text}`;
      }
    } catch {}
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Gemini image ${res.status}: ${JSON.stringify(json).slice(0, 400)}`);
  // Find inlineData image part
  const cand = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = cand.find((p) => p.inlineData || p.inline_data);
  const data = imgPart?.inlineData?.data || imgPart?.inline_data?.data;
  const mime = imgPart?.inlineData?.mimeType || imgPart?.inline_data?.mime_type || "image/png";
  if (!data) throw new Error("Gemini no image returned");
  return { buffer: Buffer.from(data, "base64"), contentType: mime, url: null };
}
