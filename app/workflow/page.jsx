export const metadata = {
  title: "Workflow Visual | BaristaConnect",
  description: "Alur end-to-end BaristaConnect: dari daftar hingga kerja.",
};

const STEPS = [
  { id: "01", title: "Daftar & Profil", desc: "Barista buat profil, owner buat coffee shop profile.", role: "barista + owner", icon: "①" },
  { id: "02", title: "Pasang / Cari Lowongan", desc: "Owner posting job, barista filter lokasi & jadwal.", role: "owner → barista", icon: "②" },
  { id: "03", title: "Apply 1-Klik", desc: "Lamaran masuk dashboard owner, notifikasi real-time.", role: "barista → owner", icon: "③" },
  { id: "04", title: "Chat & Interview", desc: "Chat in-app, jadwal interview, reminder.", role: "both", icon: "④" },
  { id: "05", title: "Hired & Onboarding", desc: "Status hired, shift pertama, rating & riwayat kerja.", role: "owner → barista", icon: "⑤" },
];

export default function WorkflowPage() {
  return (
    <div className="bg-[var(--color-cream)] min-h-[calc(100vh-200px)]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-[var(--color-caramel)] uppercase">Visual Workflow</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-espresso)] lg:text-4xl">
              BaristaConnect End-to-End
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[var(--color-espresso-soft)]">
              Satu alur terhubung: profil, lowongan, lamaran, chat, dan hiring. Tidak ada spreadsheet, tidak ada DM hilang.
            </p>
          </div>
          <a href="/jobs" className="inline-flex h-10 items-center rounded-full bg-[var(--color-caramel)] px-6 text-sm font-bold text-white hover:bg-[var(--color-caramel-dark)]">
            Lihat Lowongan
          </a>
        </div>

        <div className="grid gap-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5 lg:p-6">
          <div className="hidden items-center gap-3 px-2 lg:flex">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-espresso)] text-sm font-bold text-white">
                  {s.icon}
                </div>
                {i < STEPS.length - 1 && <div className="h-px flex-1 bg-[var(--color-latte)]" />}
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s) => (
              <div key={s.id} className="rounded-2xl border border-[var(--color-latte)] bg-[var(--color-cream-dark)] p-5">
                <div className="flex items-center gap-2 lg:hidden">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-espresso)] text-sm font-bold text-white">{s.icon}</span>
                  <span className="text-xs font-bold tracking-widest text-[var(--color-caramel)]">{s.id}</span>
                </div>
                <p className="mt-3 hidden text-xs font-bold tracking-widest text-[var(--color-caramel)] lg:block">{s.id} · {s.role}</p>
                <h3 className="mt-1 text-[15px] font-extrabold text-[var(--color-espresso)]">{s.title}</h3>
                <p className="mt-2 text-sm leading-5 text-[var(--color-espresso-soft)]">{s.desc}</p>
                <p className="mt-3 text-xs font-semibold text-[var(--color-gold)] lg:hidden">{s.role}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--color-espresso)] px-5 py-4 text-white">
            <p className="text-sm font-medium">Data live dari Supabase. Route ini Server Component (Next.js 16 App Router).</p>
            <div className="flex gap-2">
              <a href="/dashboard/barista" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--color-espresso)]">Dashboard Barista</a>
              <a href="/dashboard/owner" className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/20">Dashboard Owner</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
