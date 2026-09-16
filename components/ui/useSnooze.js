"use client";

import { useCallback, useEffect, useState } from "react";

// Pola dismiss bersama: klik X → hilang → refresh 1 tetap hilang → refresh 2 muncul lagi.
// Penyebab bug lama: baca localStorage saat render (ikut hasil SSR), tanpa koreksi setelah mount.
const DEFAULT_VIEWS = 2;

function readRec(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Dipakai di dalam useEffect saat mount: true = boleh tampil (sekaligus majukan hitungan).
export function snoozeCheck(key, maxViews = DEFAULT_VIEWS) {
  const rec = readRec(key);
  if (!rec || typeof rec.v !== "number") return true;
  const views = rec.v + 1;
  try {
    if (views >= maxViews) {
      window.localStorage.removeItem(key);
      return true;
    }
    window.localStorage.setItem(key, JSON.stringify({ v: views }));
  } catch {}
  return false;
}

// Dipakai saat klik X: mulai hitungan snooze dari 0.
export function snoozeHide(key) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ v: 0 }));
  } catch {}
}

// Hook untuk komponen yang render sendiri (strip/ kartu):
// visible === null = belum tahu (jangan render apa-apa, cegah kedip hasil SSR).
export function useSnooze(key, maxViews = DEFAULT_VIEWS) {
  const [visible, setVisible] = useState(null);

  // Koreksi pasca-mount: hasil render server selalu visible=true (tanpa akses
  // localStorage); sinkronkan dengan penyimpanan browser tepat sekali di sini.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(snoozeCheck(key, maxViews));
  }, [key, maxViews]);

  const dismiss = useCallback(() => {
    snoozeHide(key);
    setVisible(false);
  }, [key]);

  return [visible, dismiss];
}
