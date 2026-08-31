import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiConfigured, loadConversationContext, suggestReply } from "@/lib/ai";

export async function POST(request) {
  if (!aiConfigured()) {
    return NextResponse.json({ error: "AI not configured" }, { status: 501 });
  }

  try {
    const { conversationId } = await request.json();
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const context = await loadConversationContext(conversationId, user.id);
    if (!context) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const result = await suggestReply({ context });
    if (!result?.draft) {
      return NextResponse.json({ error: "empty draft" }, { status: 502 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("suggest error:", err.message);
    return NextResponse.json({ error: "AI unavailable" }, { status: 502 });
  }
}
