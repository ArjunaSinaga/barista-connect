"use client";

import { useEffect, useState } from "react";

// Polaroid hero: rotasi foto CAFE (cafes.photo_urls) tiap 4 detik.
// Bukan foto owner (owners.avatar_url tidak pernah masuk ke `photos`).
export default function HeroPhoto({ photos }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), 4000);
    return () => clearInterval(t);
  }, [photos.length]);

  const active = photos[idx] ?? photos[0];

  return (
    <figure className="rotate-2 rounded-sm bg-[#c6bba2] p-3 pb-4 shadow-[0_10px_30px_rgba(26,15,10,0.18)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2px]">
        {photos.map((p, i) => (
          <img
            key={p.url}
            src={p.url}
            alt={p.cafe ? `Foto ${p.cafe}` : "Foto cafe"}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <figcaption
        key={active.url}
        className="font-chalk mt-2 text-center text-lg text-[#2f2721]/70"
      >
        {active.cafe ? `— ${active.cafe} —` : "— shift pagi, aroma robusta —"}
      </figcaption>
    </figure>
  );
}
