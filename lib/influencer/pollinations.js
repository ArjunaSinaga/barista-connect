// ponytail: free unlimited via pollinations flux, seed-locked for face retention before swap
const BASE = "https://image.pollinations.ai/prompt";

export function buildPrompt(basePrompt, theme) {
  return `${basePrompt}, ${theme}, photoreal, skin texture, sharp focus, 9:16 portrait`;
}

export async function generatePollinations({ prompt, seed = 12345, width = 768, height = 1360, model = "flux", nologo = true }) {
  const encoded = encodeURIComponent(prompt);
  const url = `${BASE}/${encoded}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=${nologo}`;
  // pollinations returns image directly — fetch to verify and return url
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Pollinations ${res.status}`);
  // Return the URL itself (pollinations is hot-linkable) — caller can upload to supabase
  // Verify it's an image
  const ct = res.headers.get("content-type") || "";
  if (!ct.startsWith("image")) throw new Error(`Pollinations non-image: ${ct}`);
  // Fetch as arrayBuffer for upload
  const buf = await res.arrayBuffer();
  return { url, buffer: Buffer.from(buf), contentType: ct };
}
