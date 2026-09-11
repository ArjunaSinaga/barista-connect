"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, LoaderCircle } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export default function ChatWindow({
  conversationId,
  meId,
  counterpartName,
  counterpartAvatar,
  jobTitle,
  initialMessages = [],
}) {
  const toast = useToast();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [aiHandedOff, setAiHandedOff] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new;
          setMessages((cur) =>
            cur.some((x) => x.id === m.id) ? cur : [...cur, m]
          );
          setAiHandedOff(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleSend(e) {
    e?.preventDefault();
    const body = input.trim();
    if (!body || sending) return;

    setSending(true);
    setInput("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: meId, body })
        .select()
        .single();
      if (error) throw error;
      setMessages((cur) =>
        cur.some((x) => x.id === data.id) ? cur : [...cur, data]
      );

      // Trigger AI auto-responder (fire, but keep UI responsive)
      fetch("/api/ai/autorespond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json?.escalated) setAiHandedOff(true);
        })
        .catch(() => {});
    } catch {
      toast("Pesan gagal terkirim", "error");
      setInput(body);
    } finally {
      setSending(false);
    }
  }

  async function handleSuggest() {
    if (suggesting) return;
    setSuggesting(true);
    let json = null;
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      json = await res.json();
      if (!res.ok || !json.draft) {
        throw new Error(json.error || "no draft");
      }
      setInput(json.draft);
    } catch {
      toast(
        json?.error === "AI not configured"
          ? "AI belum aktif — isi GEMINI_API_KEY di .env.local"
          : "AI sedang tidak tersedia",
        "error"
      );
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-2xl flex-col px-4">
      {/* header */}
      <div className="flex items-center gap-3 rounded-2xl card-dark px-4 py-3 border border-latte">
        <Link
          href="/messages"
          aria-label="Kembali"
          className="rounded-full p-2 bg-cream-dark text-espresso hover:bg-latte"
        >
          <ArrowLeft size={18} />
        </Link>
        <Avatar src={counterpartAvatar} name={counterpartName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-espresso">
            {counterpartName}
          </p>
          {jobTitle && (
            <span className="mt-1 inline-flex rounded-full bg-caramel/15 px-2.5 py-0.5 text-[11px] font-bold text-caramel">
              re: {jobTitle}
            </span>
          )}
        </div>
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Realtime" />
      </div>

      {/* messages */}
      <div className="flex-1 space-y-3 overflow-y-auto py-6 px-1">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <p className="max-w-xs text-sm text-espresso-soft">
              Belum ada pesan. Sapa {counterpartName} —{" "}
              <button
                onClick={handleSuggest}
                className="font-bold text-caramel hover:underline"
              >
                atau minta AI buat draf pembuka ✨
              </button>
            </p>
          </div>
        )}

        {messages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[80%]">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    mine
                      ? "rounded-br-sm bg-gradient-to-br from-[#d4a24e] to-[#b56a2a] text-white"
                      : "rounded-bl-sm card-dark border border-latte text-espresso"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-white/70 text-right" : "text-espresso-soft"}`}>{new Date(m.created_at).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}</p>
                </div>
                {m.is_ai && (
                  <p
                    className={`mt-1 flex items-center gap-1 text-[10px] font-bold ${
                      mine ? "justify-end text-caramel/80" : "text-caramel"
                    }`}
                  >
                    <Sparkles size={10} /> dijawab asisten AI — akan
                    dikonfirmasi {mine ? "" : "oleh pihak terkait"}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {aiHandedOff && (
          <p className="text-center text-[11px] italic text-espresso-soft">
            ✨ Asisten menyerahkan pertanyaan ini ke {counterpartName}.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* composer */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-16 space-y-2 rounded-2xl card-dark border border-latte p-3 shadow-lg md:bottom-2"
      >
        {!sending && (
          <button
            type="button"
            onClick={handleSuggest}
            disabled={suggesting}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-caramel/40 card-dark px-3 py-1.5 text-[11px] font-bold text-caramel hover:bg-caramel/5 disabled:opacity-60"
          >
            {suggesting ? (
              <>
                <LoaderCircle size={11} className="animate-spin" />
                Menyusun draf...
              </>
            ) : (
              <>
                <Sparkles size={11} /> Sarankan balasan
              </>
            )}
          </button>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Tulis pesan... (Enter kirim, Shift+Enter baris baru)"
            maxLength={2000}
            className="max-h-28 w-full resize-none rounded-xl border border-latte card-dark px-4 py-3 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            aria-label="Kirim"
            className="shrink-0 self-end rounded-xl bg-caramel p-3 text-white shadow-sm transition-colors hover:bg-caramel-dark disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
