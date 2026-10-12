"use client";

import { useEffect } from "react";

// Satu listener global (delegasi) untuk efek yang butuh posisi mouse:
// .fx-ripple (riak dari titik klik), .fx-tilt, .fx-spotlight, .fx-magnetic.
// Tanpa library tambahan.
export default function FxMount() {
  useEffect(() => {
    const onPointerDown = (e) => {
      const el = e.target?.closest?.(".fx-ripple");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ink = document.createElement("span");
      ink.className = "fx-ripple-ink";
      ink.style.width = ink.style.height = `${size}px`;
      ink.style.left = `${e.clientX - rect.left - size / 2}px`;
      ink.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(ink);
      setTimeout(() => ink.remove(), 600);
    };

    const onPointerMove = (e) => {
      const tilt = e.target?.closest?.(".fx-tilt");
      document.querySelectorAll(".fx-tilt.fx-live").forEach((el) => {
        if (el !== tilt) el.style.transform = "";
        el.classList.remove("fx-live");
      });
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = `perspective(700px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-2px)`;
        tilt.classList.add("fx-live");
      }

      const spot = e.target?.closest?.(".fx-spotlight");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--fx-x", `${e.clientX - r.left}px`);
        spot.style.setProperty("--fx-y", `${e.clientY - r.top}px`);
      }

      const mag = e.target?.closest?.(".fx-magnetic");
      document.querySelectorAll(".fx-magnetic.fx-live").forEach((el) => {
        if (el !== mag) el.style.transform = "";
        el.classList.remove("fx-live");
      });
      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mag.style.transform = `translate(${(dx * 0.12).toFixed(1)}px, ${(dy * 0.12).toFixed(1)}px)`;
        mag.classList.add("fx-live");
      }
    };

    const onPointerOut = (e) => {
      const t = e.target?.closest?.(".fx-tilt.fx-live, .fx-magnetic.fx-live");
      if (t && !t.contains(e.relatedTarget)) {
        t.style.transform = "";
        t.classList.remove("fx-live");
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }, []);

  return null;
}
