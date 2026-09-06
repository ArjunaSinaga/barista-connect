"use client";
import { useState, useRef, useEffect } from "react";

const QUICK = [
  "plan: cek struktur project & kasih saran",
  "build: cek error build & fix",
  "review: audit code yang baru aku ubah",
  "tulis fitur: ... (isi lanjut)",
  "jelaskan file app/... ini ngapain",
  "git status & diff ringkas",
];

export default function OpencodeMobilePage() {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content:
        "OpenCode Mobile aktif — otak fokus ke project ini (barista-connect).\n\nAku bisa dari HP: plan, build, review, nulis code, jelasin error, semua tanpa laptop. Tulis perintah bebas, atau tap chip di bawah.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bot = useRef(null);

  useEffect(() => {
    bot.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send(t) {
    const text = t || input;
    if (!text.trim() || loading) return;
    const u = { role: "user", content: text };
    setMsgs((m) => [...m, u]);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/mobile/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `[OPENCODE-MOBILE] ${text}`, history: msgs }),
      });
      const j = await r.json();
      setMsgs((m) => [...m, { role: "assistant", content: j.reply || j.error || "Error" }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", content: "Gagal: " + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] text-white flex flex-col">
      {/* header - opencode style */}
      <div className="bg-[#0a0a0a] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-black grid place-items-center font-black text-sm">OC</div>
          <div>
            <div className="font-mono font-bold text-sm tracking-widest">OPENCODE // MOBILE</div>
            <div className="text-[11px] opacity-60 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Default Project • Muse Spark 1.2
            </div>
          </div>
        </div>
        <a href="/m" className="text-xs font-mono bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
          /m
        </a>
      </div>

      <div className="px-3 py-2 bg-[#141414] border-b border-white/10 flex gap-2 overflow-x-auto shrink-0">
        <span className="text-xs font-mono opacity-40 py-1.5 whitespace-nowrap">TAP →</span>
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="text-xs font-mono bg-white text-black px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 active:bg-zinc-200"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#0a0a0a]">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed font-mono whitespace-pre-wrap " +
              (m.role === "user"
                ? "ml-auto bg-white text-black rounded-br-sm"
                : "bg-[#1a1a1a] border border-white/10 rounded-bl-sm")
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm opacity-60 font-mono">
            opencode thinking...
          </div>
        )}
        <div ref={bot} />
      </div>

      <div className="p-3 bg-[#141414] border-t border-white/10 flex gap-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Perintah opencode... (build, plan, review)"
          className="flex-1 bg-black border border-white/15 rounded-full px-4 py-3 text-sm outline-none focus:border-white/30 font-mono placeholder:opacity-40"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-white disabled:opacity-30 text-black w-11 h-11 rounded-full grid place-items-center shrink-0 text-lg font-bold"
        >
          ↑
        </button>
      </div>

      <div className="bg-black border-t border-white/10 px-4 py-2 flex justify-between text-[10px] font-mono opacity-30">
        <span>tunnel: joan-pic-for...trycloudflare.com</span>
        <span>PWA • Add to Home Screen = APK</span>
      </div>
    </div>
  );
}
