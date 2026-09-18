import { NextResponse } from "next/server";
import { rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

// ponytail: error tracking tanpa vendor — log client masuk Vercel logs, rate-limited.
export async function POST(req) {
  const rl = rateLimit(req, { scope: "client-log", limit: 20 });
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);
  try {
    const { message, url } = await req.json();
    console.error(`[client] ${url ?? "?"}: ${String(message ?? "").slice(0, 300)}`);
  } catch {
    // diam: logging tak boleh merusak app
  }
  return NextResponse.json({ ok: true });
}
