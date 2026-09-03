import { NextResponse } from "next/server";
import { kiraKnowledgeQuery, isKiraConfigured } from "@/lib/kira";

export async function POST(request) {
  if (!isKiraConfigured()) {
    return NextResponse.json(
      { error: "KIRA_API_KEY not configured" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = body?.input?.trim();
  if (!input) {
    return NextResponse.json(
      { error: "`input` is required" },
      { status: 400 }
    );
  }

  try {
    const data = await kiraKnowledgeQuery(input);
    return NextResponse.json(data);
  } catch (e) {
    const status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502;
    return NextResponse.json(
      { error: e.message, details: e.details ?? null },
      { status }
    );
  }
}
