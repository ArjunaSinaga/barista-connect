"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const QUICK = [
  "Jelaskan error build terakhir",
  "Buatkan komponen baru",
  "Cek status deploy",
  "Optimasi query Supabase",
  "Buat fitur chat mobile",
];

export default function MPage() {
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Hai! Aku otak BaristaConnect versi mobile. Lagi di luar tanpa laptop? Tanya aja - mau cek project, debug, atau minta bikinin code." },
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
        body: JSON.stringify({ message: text, history: msgs }),
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
    <div className="fixed inset-0 z-[100] bg-[#f2f0eb] flex flex-col">
      <div className="bg-[#1e3932] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <div className="font-bold text-sm tracking-wide">BARISTA CONNECT // MOBILE</div>
          <div className="text-[11px] opacity-70 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Otak aktif - fokus project ini
          </div>
        </div>
        <Link href="/" className="text-xs bg-white/15 px-3 py-1.5 rounded-full">
          Desktop
        </Link>
      </div>

      <div className="px-3 py-2 bg-[#e6e6e0] border-b flex gap-2 overflow-x-auto shrink-0">
        <span className="text-xs opacity-50 py-1.5 whitespace-nowrap">Tambah ke Layar Utama = jadi App</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f2f0eb]">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed " +
              (m.role === "user"
                ? "ml-auto bg-[#1e3932] text-white rounded-br-sm"
                : "bg-white border rounded-bl-sm shadow-sm whitespace-pre-wrap")
            }
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="bg-white border rounded-2xl px-3.5 py-2.5 text-sm opacity-70">mengetik...</div>}
        <div ref={bot} />
      </div>

      <div className="px-3 py-2 bg-[#f2f0eb] border-t flex gap-1.5 overflow-x-auto shrink-0">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="text-xs bg-white border border-[#cba258]/30 px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 active:bg-[#cba258] active:text-white"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="p-3 bg-white border-t flex gap-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Tanya otak project ini..."
          className="flex-1 bg-[#f2f0eb] border rounded-full px-4 py-3 text-sm outline-none focus:border-[#cba258]"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-[#00754a] disabled:opacity-40 text-white w-11 h-11 rounded-full grid place-items-center shrink-0 text-lg"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
