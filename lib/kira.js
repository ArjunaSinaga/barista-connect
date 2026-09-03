// lib/kira.js — Kira A2A agent-link client
// Env: KIRA_API_KEY (kl_live_...), KIRA_A2A_URL (optional override)

export const KIRA_A2A_URL =
  process.env.KIRA_A2A_URL ||
  "https://mapi.kiraai.ai/v1/agent-link/a2a/@you/knowledge_query";

export function isKiraConfigured() {
  return Boolean(process.env.KIRA_API_KEY);
}

/**
 * Query Kira knowledge base via A2A.
 * @param {string} input - user question e.g. "What are your prices..."
 * @param {{ signal?: AbortSignal, timeoutMs?: number }} opts
 * @returns {Promise<any>} parsed JSON from Kira
 */
export async function kiraKnowledgeQuery(input, opts = {}) {
  if (!input || typeof input !== "string") {
    throw new Error("kiraKnowledgeQuery: `input` must be a non-empty string");
  }
  const apiKey = process.env.KIRA_API_KEY;
  if (!apiKey) throw new Error("KIRA_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 15000
  );
  if (opts.signal) {
    opts.signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  try {
    const res = await fetch(KIRA_A2A_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
      signal: controller.signal,
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        json?.error?.message || json?.message || `Kira A2A ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.details = json;
      throw err;
    }

    return json;
  } finally {
    clearTimeout(timeout);
  }
}
