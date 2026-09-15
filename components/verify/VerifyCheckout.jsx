"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";

function fmt(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function VerifyCheckout({ amount, label }) {
  const toast = useToast();
  const [phase, setPhase] = useState("idle"); // idle | qr | paid | expired
  const [order, setOrder] = useState(null);
  const [left, setLeft] = useState(0);
  const timer = useRef(null);
  const poller = useRef(null);

  async function start() {
    setPhase("loading");
    try {
      const res = await fetch("/api/verify/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat QR");
      if (data.reused) {
        const st = await fetch(`/api/verify/status?orderId=${data.orderId}`).then((r) => r.json());
        if (st.status === "paid") return setPhase("paid");
      }
      const exp = data.expiresAt ? Math.max(0, Math.round((new Date(data.expiresAt) - Date.now()) / 1000)) : 600;
      setOrder(data);
      setLeft(exp);
      setPhase("qr");
    } catch (e) {
      toast(e.message, "error");
      setPhase("idle");
    }
  }

  useEffect(() => {
    if (phase !== "qr" || !order) return;
    timer.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(timer.current);
          clearInterval(poller.current);
          setPhase("expired");
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    poller.current = setInterval(async () => {
      try {
        const st = await fetch(`/api/verify/status?orderId=${order.orderId}`).then((r) => r.json());
        if (st.status === "paid") {
          clearInterval(timer.current);
          clearInterval(poller.current);
          setPhase("paid");
        } else if (st.status === "expired") {
          clearInterval(timer.current);
          clearInterval(poller.current);
          setPhase("expired");
        }
      } catch {}
    }, 3000);
    return () => {
      clearInterval(timer.current);
      clearInterval(poller.current);
    };
  }, [phase, order]);

  if (phase === "paid") {
    return (
      <div className="rounded-xl bg-matcha/10 px-4 py-5 text-center">
        <p className="text-lg font-black text-matcha">Pembayaran berhasil!</p>
        <p className="mt-1 text-sm font-semibold text-espresso">Centang biru sudah aktif di profilmu.</p>
        <a href="/dashboard/barista/profile" className="mt-3 inline-block rounded-xl bg-[#3d2c1e] px-5 py-2.5 text-sm font-bold text-white">Lihat Profil Saya</a>
      </div>
    );
  }

  if (phase === "qr" && order) {
    return (
      <div className="text-center">
        <p className="text-sm font-bold text-espresso">Scan QRIS untuk bayar Rp{amount.toLocaleString("id-ID")}</p>
        <p className={`mt-1 text-2xl font-black tabular-nums ${left < 60 ? "text-red-500" : "text-caramel"}`}>{fmt(left)}</p>
        {order.qrUrl ? (
          <img src={order.qrUrl} alt="QRIS" className="mx-auto mt-3 h-56 w-56 rounded-xl border border-latte bg-white" />
        ) : order.qrString ? (
          <p className="mx-auto mt-3 max-w-full overflow-hidden rounded-xl bg-cream p-3 text-[10px] break-all text-espresso-soft">{order.qrString}</p>
        ) : null}
        <p className="mt-3 text-xs text-espresso-soft">Menunggu pembayaran… halaman ini otomatis lanjut setelah kamu bayar.</p>
      </div>
    );
  }

  if (phase === "expired") {
    return (
      <div className="text-center">
        <p className="text-sm font-bold text-espresso">QR kedaluwarsa (10 menit habis).</p>
        <button onClick={() => { setPhase("idle"); start(); }} className="mt-3 rounded-xl bg-caramel px-6 py-2.5 text-sm font-bold text-white hover:bg-caramel-dark">
          Buat QR Baru
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={start}
      disabled={phase === "loading"}
      className="w-full rounded-xl bg-caramel px-6 py-3 text-sm font-black text-white hover:bg-caramel-dark disabled:opacity-50"
    >
      {phase === "loading" ? "Membuat QR…" : `Bayar Rp${amount.toLocaleString("id-ID")} — ${label}`}
    </button>
  );
}
