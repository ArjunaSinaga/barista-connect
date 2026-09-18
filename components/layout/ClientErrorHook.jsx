"use client";

import { useEffect } from "react";

// ponytail: 1 hook, kirim error browser ke /api/client-log (fire-and-forget).
export default function ClientErrorHook() {
  useEffect(() => {
    const send = (message) => {
      try {
        fetch("/api/client-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: String(message).slice(0, 300), url: window.location.pathname }),
        }).catch(() => {});
      } catch {
        // diam
      }
    };
    const onError = (e) => send(e.message || "window.onerror");
    const onReject = (e) => send(e.reason?.message || e.reason || "unhandledrejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
    };
  }, []);
  return null;
}
