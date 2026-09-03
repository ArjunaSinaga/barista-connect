"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// lightweight picker: OSM TileLayer + Nominatim reverse/search = zero-cost, no Google billing WAJIB
const MapCore = dynamic(() => import("./MapCore"), { ssr: false, loading: () => <div className="grid h-[320px] place-items-center rounded-xl border border-latte bg-[#16100d] text-sm text-espresso-soft">Memuat peta…</div> });

export default function OsmMapPicker({ value, onChange }) {
  const [q, setQ] = useState(value?.address || "");
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);

  const pos = value?.lat && value?.lng ? [value.lat, value.lng] : [-6.208, 106.83];

  const reverse = useCallback(async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`, { headers: { Accept: "application/json" } });
      const j = await r.json();
      onChange?.({ lat, lng, address: j.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      setQ(j.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch {
      onChange?.({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
    }
  }, [onChange]);

  async function search() {
    if (!q.trim() || q.trim().length < 3) return;
    setLoading(true);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=5&countrycodes=id&accept-language=id`, { headers: { Accept: "application/json" } });
      const j = await r.json();
      setHits(j);
    } catch { setHits([]); }
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&(e.preventDefault(),search())} placeholder="Cari alamat / drag pin di peta" className="flex-1 rounded-xl border border-latte bg-white px-3 py-2.5 text-sm text-[#1c1412] placeholder:text-[#1c1412]/40 focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/20" />
        <button type="button" onClick={search} disabled={loading} className="rounded-xl bg-caramel px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{loading?"Mencari…":"Cari"}</button>
      </div>
      {hits.length>0 && <ul className="max-h-40 overflow-auto rounded-xl border border-latte bg-[#16100d]">{hits.map((h)=><li key={h.place_id}><button type="button" onClick={()=>{const lat=parseFloat(h.lat),lng=parseFloat(h.lon); onChange?.({lat,lng,address:h.display_name}); setQ(h.display_name); setHits([]);}} className="w-full px-3 py-2 text-left text-xs leading-snug text-[#fdf6ec] hover:bg-[#251b19]">{h.display_name}</button></li>)}</ul>}
      <div className="overflow-hidden rounded-2xl border border-[#2c241f]">
        <MapCore pos={pos} onPick={reverse} />
      </div>
      {value?.lat && <p className="text-xs text-espresso-soft">Pin: {value.lat.toFixed(6)}, {value.lng.toFixed(6)} — {value.address?.slice(0,120)}</p>}
      <p className="text-[11px] leading-snug text-espresso-soft">© OpenStreetMap contributors · zero-cost · tidak pakai Google Billing</p>
    </div>
  );
}
