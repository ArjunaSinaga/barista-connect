// lib/rate-limit.js — in-memory sliding window (per instance).
// Cukup untuk Vercel serverless skala kecil; upgrade ke Upstash Redis kalau traffic besar.
const buckets = new Map();

function getKey(request, scope) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

export function rateLimit(request, { scope = "api", limit = 20, windowMs = 60_000 } = {}) {
  const key = getKey(request, scope);
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - hits[0])) / 1000);
    return { ok: false, retryAfter };
  }
  hits.push(now);
  buckets.set(key, hits);
  // Bersihkan sesekali biar map tidak bengkak
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return { ok: true };
}

export function rateLimitedResponse(retryAfter) {
  return new Response(JSON.stringify({ error: "Terlalu banyak permintaan, coba lagi nanti" }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
  });
}
