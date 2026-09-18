import Link from "next/link";
import { Briefcase, FileText, CheckCheck, FlagOff, MessagesSquare, ArrowRight } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { STATUS_META } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import Badge from "@/components/ui/Badge";

export const metadata = { title: "Dashboard Barista" };

export default async function BaristaDashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-bold text-espresso">Koneksi database belum siap.</p>
        <p className="mt-1 text-sm text-espresso-soft">Coba muat ulang halaman ini.</p>
      </div>
    );
  }
  const { user, profile } = await getSessionSafe();
  if (!user) {
    return (
      <div className="p-8 text-center">
        Silakan login di <a href="/login" className="text-caramel underline">/login</a>.
      </div>
    );
  }
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from("applications")
    .select("id, status, created_at, job_post_id, job_posts ( id, title )")
    .eq("barista_id", user.id)
    .order("created_at", { ascending: false });
  const jobOwnerIds = [...new Set((apps ?? []).map((a) => a.job_posts?.id).filter(Boolean))];
  let ownerMap = new Map();
  if (jobOwnerIds.length) {
    const { data: jobs } = await supabase.from("job_posts").select("id, owner_id").in("id", jobOwnerIds);
    const oIds = [...new Set((jobs ?? []).map((j) => j.owner_id).filter(Boolean))];
    const jobMap = new Map((jobs ?? []).map((j) => [j.id, j.owner_id]));
    if (oIds.length) {
      const { data: owners } = await supabase.from("owners_public").select("id, business_name").in("id", oIds);
      const oMap = new Map((owners ?? []).map((o) => [o.id, o.business_name]));
      for (const a of apps ?? []) ownerMap.set(a.id, oMap.get(jobMap.get(a.job_post_id)) ?? null);
    }
  }

  const list = apps ?? [];
  const count = (s) => list.filter((a) => a.status === s).length;
  const total = list.length;
  const waiting = count("pending") + count("viewed");
  const accepted = count("accepted");
  const done = count("terminated");
  const recent = list.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-caramel uppercase">Dasbor Barista</p>
          <h1 className="text-3xl font-black text-espresso leading-none mt-1">Dashboard Saya</h1>
          <p className="text-sm text-espresso-soft mt-2 max-w-xl">
            Pantau lamaran, lanjutkan yang diterima, dan nilai cafe tempatmu selesai bekerja.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/barista/applications" className="inline-flex items-center gap-2 rounded-full border border-latte bg-white px-5 py-3 text-sm font-bold text-espresso hover:border-caramel">
            <FileText size={16} /> Lamaran Saya
          </Link>
          <Link href="/messages" className="inline-flex items-center gap-2 rounded-full border border-latte bg-white px-5 py-3 text-sm font-bold text-espresso hover:border-caramel">
            <MessagesSquare size={16} /> Pesan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl border border-caramel/40 bg-caramel/10 p-4">
          <p className="text-xs font-bold tracking-widest text-caramel uppercase">Total Lamaran</p>
          <p className="text-3xl font-black text-espresso mt-1">{total}</p>
          <p className="text-xs text-espresso-soft mt-1 flex items-center gap-1"><Briefcase size={12} />terkirim</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
          <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">Menunggu</p>
          <p className="text-3xl font-black text-espresso mt-1">{waiting}</p>
          <p className="text-xs text-espresso-soft mt-1">terkirim + dilihat</p>
        </div>
        <div className="rounded-2xl border border-matcha/40 bg-matcha/10 p-4">
          <p className="text-xs font-bold tracking-widest text-matcha uppercase">Diterima</p>
          <p className="text-3xl font-black text-espresso mt-1">{accepted}</p>
          <p className="text-xs text-espresso-soft mt-1 flex items-center gap-1"><CheckCheck size={12} />sedang bekerja</p>
        </div>
        <div className="rounded-2xl bg-[#3d2c1e] text-white border border-[#3d2c1e] p-4">
          <p className="text-xs font-bold tracking-widest text-latte uppercase">Selesai</p>
          <p className="text-3xl font-black mt-1">{done}</p>
          <p className="text-xs text-latte mt-1 flex items-center gap-1"><FlagOff size={12} />bisa dinilai</p>
        </div>
      </div>

      {total === 0 && (
        <div className="rounded-2xl border border-caramel/40 bg-caramel/10 p-5 mb-8">
          <h2 className="text-sm font-black text-espresso">3 langkah mulai kerja 🚀</h2>
          <ol className="mt-3 space-y-2">
            <li>
              <Link href="/dashboard/barista/profile" className="flex items-center gap-3 text-sm font-bold text-espresso hover:text-caramel">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-caramel text-xs font-black text-white">1</span>
                Lengkapi profil + foto + CV
              </Link>
            </li>
            <li>
              <Link href="/jobs" className="flex items-center gap-3 text-sm font-bold text-espresso hover:text-caramel">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-caramel text-xs font-black text-white">2</span>
                Lamar 1 lowongan pertama
              </Link>
            </li>
            <li>
              <Link href="/messages" className="flex items-center gap-3 text-sm font-bold text-espresso hover:text-caramel">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-caramel text-xs font-black text-white">3</span>
                Cek kabar di Pesan
              </Link>
            </li>
          </ol>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-latte overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-latte">
          <h2 className="text-sm font-black text-espresso flex items-center gap-2"><FileText size={16} className="text-caramel" /> Lamaran Terbaru</h2>
          <Link href="/dashboard/barista/applications" className="text-xs font-bold text-caramel hover:underline">Lihat semua</Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-6">
            <p className="text-sm text-espresso-soft">
              Belum ada lamaran. Cari lowongan di bawah dan kirim lamaran pertamamu.
            </p>
            <Link href="/jobs" className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-[#3d2c1e] px-5 text-[13px] font-bold text-white hover:bg-[#2e2015]">
              Cari lowongan
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-latte">
            {recent.map((a) => {
              const meta = STATUS_META[a.status] ?? STATUS_META.pending;
              return (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-espresso">{a.job_posts?.title ?? "Lowongan dihapus"}</p>
                    <p className="truncate text-xs text-espresso-soft">
                      {ownerMap.get(a.id) ?? "-"} • {relativeTime(a.created_at)}
                    </p>
                  </div>
                  <Badge classes={meta.classes}>{meta.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-[#e8e0cf] bg-[#ffffff] p-5 shadow-[0_1px_3px_rgba(43,33,24,0.08)]">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold text-[#2b2118]">Cari lowongan di job board</h2>
          <p className="mt-0.5 text-xs text-[#857768]">Jelajahi lowongan aktif, simpan favoritmu, dan lamar langsung.</p>
        </div>
        <Link href="/jobs" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#3d2c1e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2e2015]">
          Buka Loker <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
