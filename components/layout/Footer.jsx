import Link from "next/link";

const COLS = [
  {
    title: "Untuk Pencari Kerja",
    links: [
      ["Cari Pekerjaan", "/jobs"],
      ["Buat Profil", "/signup?role=barista"],
      ["Career Tips", "/academy"],
    ],
  },
  {
    title: "Untuk Bisnis",
    links: [
      ["Pasang Lowongan", "/signup?role=owner"],
      ["Cari Talenta", "/talent"],
      ["Solusi Rekrutmen", "/trust"],
    ],
  },
  // LP-21: kolom berisi link mati ("#") dibuang — nol dead route produksi.
];

const SOCIALS = [
  ["Instagram", "#", "M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9C2.4 3.9 4 2.3 7.2 2.2 8.4 2.2 8.8 2.2 12 2.2zm0 3.6a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zm0 10.2a4 4 0 110-8 4 4 0 010 8zm6.4-10.5a1.4 1.4 0 11-2.9 0 1.4 1.4 0 012.9 0z"],
  ["LinkedIn", "#", "M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6h.1c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2 2 0 110-4.1 2 2 0 010 4.1zM7.1 20.4H3.6V9h3.5v11.4z"],
  ["TikTok", "#", "M19.6 8.7a5 5 0 01-3.5-1.7v6.5a6.1 6.1 0 11-6.1-6.1c.3 0 .7 0 1 .1v3a3.1 3.1 0 102.1 3V1.5h3a5 5 0 003.5 3.7v3.5z"],
  ["YouTube", "#", "M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.7.3c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.3 7.6.3s4.6 0 7.7-.4c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.8 15V8.4l6.2 3.3-6.2 3.3z"],
];

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1400px] px-4 pb-6 sm:px-6">
      <div className="rounded-2xl bg-[#2A211A] px-6 py-8 text-[#F5F1E8] sm:px-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_repeat(2,1fr)]">
          <div>
            <p className="font-display text-xl font-semibold">kerja.inc</p>
            <p className="mt-2 max-w-[220px] text-xs leading-5 text-[#F5F1E8]/70">
              Talenta lokal untuk Indonesia yang lebih kuat.
            </p>
          </div>
          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-xs font-bold">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-xs text-[#F5F1E8]/70 hover:text-[#F5F1E8]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          {/* LP-22: kanal tanpa URL resmi disembunyikan, bukan placeholder. */}
          {SOCIALS.some(([, href]) => href !== "#") && (
          <div>
            <p className="text-xs font-bold">Ikuti kami</p>
            <div className="mt-3 flex gap-3">
              {SOCIALS.filter(([, href]) => href !== "#").map(([label, href, d]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-[#F5F1E8]/70 hover:text-[#F5F1E8]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          )}
        </div>
        <div className="mt-8 flex flex-col gap-1 border-t border-white/15 pt-4 text-[11px] text-[#F5F1E8]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 kerja.inc. Semua hak dilindungi.</p>
          <p>
            <span className="text-red-400">♥</span> Dibuat untuk Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}

