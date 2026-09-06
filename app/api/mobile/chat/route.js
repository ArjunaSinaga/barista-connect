import { NextResponse } from "next/server";
import { aiConfigured, aiProvider, callLLM } from "@/lib/ai";

export const runtime = "nodejs";

const SYSTEM = `Kamu adalah OpenCode Mobile Assistant untuk project BaristaConnect (Next.js 16 + Tailwind v4 + Supabase).

Konteks project:
- Stack: Next.js App Router, React 19, Tailwind v4, Supabase (auth, DB, RLS), Netlify deploy
- Warna: cream #f2f0eb, espresso #1e3932, caramel #00754a, gold #cba258
- Fitur: job marketplace barista (job_posts, applications, conversations, messages, notifications)
- User mengakses kamu dari HP saat di luar, tanpa laptop. Jawab ringkas, mobile-friendly, to-the-point.
- Tugas: bantu cek status project, jelaskan error/build, kasih saran code, buatkan snippet, guide deploy.
- Jika user minta aksi coding, berikan langkah + snippet siap copy. Jangan bertele-tele.
- Bahasa: ikuti bahasa user (default Indonesia santai).`;

export async function POST(req) {
  try {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
    }
    if (!aiConfigured()) {
      return NextResponse.json(
        { error: "AI belum dikonfigurasi (set GROQ_API_KEY / CEREBRAS / NVIDIA / GEMINI)" },
        { status: 503 }
      );
    }

    const transcript = history
      .slice(-10)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = transcript
      ? `Riwayat:\n${transcript}\n\nPesan baru: ${message}\n\nJawab ringkas & actionable untuk mobile.`
      : message;

    const reply = await callLLM(SYSTEM, prompt);
    return NextResponse.json({
      reply,
      provider: aiProvider(),
    });
  } catch (e) {
    console.error("[mobile/chat]", e);
    return NextResponse.json({ error: e.message || "AI error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: aiProvider(),
    configured: aiConfigured(),
    hint: "POST { message, history } ke endpoint ini",
  });
}
