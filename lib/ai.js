import { createClient } from "@/lib/supabase/server";

const BYTEZ_URL =
  "https://api.bytez.com/models/v2/openai/v1/chat/completions";
const BYTEZ_MODEL = process.env.BYTEZ_MODEL || "Qwen/Qwen3-4B";
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL || "nvidia/nemotron-3-nano-30b-a3b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "qwen-3-235b";
const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/" +
  (process.env.GEMINI_MODEL || GEMINI_MODEL) +
  ":generateContent";

export function aiProvider() {
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.CEREBRAS_API_KEY) return "cerebras";
  if (process.env.NVIDIA_API_KEY) return "nvidia";
  if (process.env.BYTEZ_API_KEY) return "bytez";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

export function aiConfigured() {
  return aiProvider() !== null;
}

/** Strip reasoning blocks some open models emit (e.g. Qwen <think>...</think>) */
function clean(text) {
  return (text ?? "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\|[^|]*\|>/g, "")
    .trim();
}

async function callNvidia(systemPrompt, userPrompt) {
  const res = await fetch(NVIDIA_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.NVIDIA_MODEL || NVIDIA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 220,
      temperature: 0.4,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `NVIDIA API ${res.status}: ${json?.detail ?? json?.title ?? "unknown"}`
    );
  }
  return clean(json?.choices?.[0]?.message?.content);
}

async function callBytez(systemPrompt, userPrompt) {
  const res = await fetch(BYTEZ_URL, {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.BYTEZ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.BYTEZ_MODEL || BYTEZ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 220,
      temperature: 0.4,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Bytez API ${res.status}: ${json?.error ?? "unknown"}`);
  }
  return clean(json?.choices?.[0]?.message?.content);
}

async function callGemini(systemPrompt, userPrompt) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.4, maxOutputTokens: 220 },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Gemini API ${res.status}`);
  }
  const text =
    json?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join("\n") ?? "";
  return clean(text);
}

async function callGroq(systemPrompt, userPrompt) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 220,
      temperature: 0.4,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Groq API ${res.status}: ${json?.error?.message ?? "unknown"}`
    );
  }
  return clean(json?.choices?.[0]?.message?.content);
}

async function callCerebras(systemPrompt, userPrompt) {
  const res = await fetch(CEREBRAS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CEREBRAS_MODEL || CEREBRAS_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 220,
      temperature: 0.4,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Cerebras API ${res.status}: ${json?.error?.message ?? "unknown"}`
    );
  }
  return clean(json?.choices?.[0]?.message?.content);
}

export async function callLLM(systemPrompt, userPrompt) {
  const providers = [
    { name: "groq", fn: callGroq },
    { name: "cerebras", fn: callCerebras },
    { name: "nvidia", fn: callNvidia },
    { name: "bytez", fn: callBytez },
    { name: "gemini", fn: callGemini },
  ];
  let lastErr;
  for (const p of providers) {
    if (!process.env[`${p.name.toUpperCase()}_API_KEY`]) continue;
    try {
      return await p.fn(systemPrompt, userPrompt);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("No AI provider configured");
}

/**
 * Load full chat context for AI prompts.
 * Returns null when the caller is not a participant.
 */
export async function loadConversationContext(conversationId, callerId) {
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select(
      `id, owner_id, barista_id, job_post_id,
       owners ( business_name ),
       barista_profiles ( full_name, years_of_experience, skills ),
       job_posts ( title, location, employment_type, description )`
    )
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv || ![conv.owner_id, conv.barista_id].includes(callerId)) {
    return null;
  }

  const { data: msgs } = await supabase
    .from("messages")
    .select("sender_id, body, is_ai, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(12);

  const transcript = (msgs ?? [])
    .reverse()
    .map((m) => {
      const who = m.sender_id === conv.owner_id ? "PEMILIK" : "BARISTA";
      return `${who}${m.is_ai ? "(via asisten AI)" : ""}: ${m.body}`;
    })
    .join("\n");

  return {
    supabase,
    conv,
    callerId,
    ownerId: conv.owner_id,
    baristaId: conv.barista_id,
    facts: [
      `Lowongan: "${conv.job_posts?.title ?? "-"}"`,
      `Tipe kerja: ${conv.job_posts?.employment_type ?? "-"}`,
      `Lokasi: ${conv.job_posts?.location ?? "-"}`,
      `Deskripsi lowongan: ${conv.job_posts?.description || "(kosong)"}`,
      `Usaha: ${conv.owners?.business_name ?? "-"}`,
      `Barista pelamar: ${conv.barista_profiles?.full_name ?? "-"} (${conv.barista_profiles?.years_of_experience ?? 0} th pengalaman, skill: ${(conv.barista_profiles?.skills ?? []).join(", ") || "-"})`,
    ].join("\n"),
    transcript: transcript || "(belum ada pesan)",
  };
}

const COMMON_RULES = `
ATURAN KERAS:
- HANYA gunakan fakta di atas. JANGAN mengarang gaji, jam shift, atau syarat yang tidak tertulis.
- Jawab singkat (maksimal 60 kata), ramah, dan santai.
- Gunakan bahasa yang sama dengan pertanyaan terakhir (Indonesia/Inggris).
- Topik di luar rekrutmen/kopi (politik, data pribadi, spam, promosi lain)
  ATAU pertanyaan yang tidak bisa dijawab dari fakta -> balik PERSIS kata: ESCALATE`;

/** Auto-responder: answers routine FAQs on behalf of the OTHER party. */
export async function autoRespond({ context }) {
  const { conv } = context;
  // The bot speaks as the other side of the caller
  const responderId =
    context.callerId === conv.owner_id ? conv.barista_id : conv.owner_id;

  // Guard 1: last message must be from the caller (no reply yet)
  const { data: lastMsgs } = await context.supabase
    .from("messages")
    .select("sender_id, created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: false })
    .limit(1);
  if (!lastMsgs?.length || lastMsgs[0].sender_id !== context.callerId) {
    return { skipped: true };
  }

  // Guard 2: rate limit — max 1 AI message per conversation per 30s, cap 50
  const { data: aiMsgs } = await context.supabase
    .from("messages")
    .select("created_at")
    .eq("conversation_id", conv.id)
    .eq("is_ai", true)
    .order("created_at", { ascending: false })
    .limit(1);
  if ((aiMsgs ?? []).length > 0) {
    const age = Date.now() - new Date(aiMsgs[0].created_at).getTime();
    if (age < 30_000) return { skipped: true };
  }
  const { count } = await context.supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conv.id)
    .eq("is_ai", true);
  if ((count ?? 0) >= 50) return { skipped: true };

  const system = `Kamu asisten virtual untuk rekrutmen barista.
Kamu menjawab PERTANYAAN TERAKHIR atas nama pihak ${
    responderId === conv.owner_id ? "PEMILIK USAHA" : "BARISTA"
  } dalam percakapan ini.

FAKTA Percakapan:
${context.facts}

RIWAYAT PESAN (terbaru di akhir):
${context.transcript}
${COMMON_RULES}`;

  const answer = await callLLM(
    system,
    "Jawab pertanyaan terakhir sesuai aturan. Ingat: jika tidak yakin atau di luar topik, balas hanya ESCALATE."
  );

  if (!answer || answer.toUpperCase().includes("ESCALATE")) {
    await context.supabase
      .from("conversations")
      .update({ needs_human: true })
      .eq("id", conv.id);
    return { escalated: true };
  }

  await context.supabase.from("messages").insert({
    conversation_id: conv.id,
    sender_id: responderId,
    body: answer,
    is_ai: true,
  });
  await context.supabase
    .from("conversations")
    .update({ needs_human: false })
    .eq("id", conv.id);

  return { ok: true };
}

/** Copilot: draft a reply AS the caller (never auto-sent). */
export async function suggestReply({ context }) {
  const { conv } = context;
  const roleLabel =
    context.callerId === conv.owner_id ? "PEMILIK USAHA" : "BARISTA";

  const system = `Kamu membantu ${roleLabel} MENULIS balasan dalam chat rekrutmen barista.

FAKTA Percakapan:
${context.facts}

RIWAYAT PESAN (terbaru di akhir):
${context.transcript}
${COMMON_RULES}
- Tulis SATU draf balasan sebagai ${roleLabel}. Tanpa awalan "Berikut draf...".
- Jika info dibutuhkan belum ada (mis. gaji), sarankan langkah lanjut yang wajar.`;

  const draft = await callLLM(system, "Buat draf balasan sekarang.");
  return { draft };
}
