import Link from "next/link";
import { Briefcase, FileText, CheckCheck, FlagOff, MessagesSquare, Search } from "lucide-react";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import { STATUS_META } from "@/lib/constants";
import { relativeTime } from "@/lib/time";
import Badge from "@/components/ui/Badge";
import JobFeed from "@/components/jobs/JobFeed";

export const metadata = { title: "Dashboard Barista" };

export default async function BaristaDashboardPage() {
  if (!isSupabaseConfigured()) return null;
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
    .select("id, status, created_at, job_posts ( id, title, owners ( business_name ) )")
    .eq("barista_id", user.id)
    .order("created_at", { ascending: false });

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
          <p className="text-xs font-bold tracking-widest text-caramel uppercase">Barista View</p>
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
        <div className="rounded-2xl bg-white border border-latte p-4">
          <p className="text-xs font-bold tracking-widest text-espresso-soft uppercase">Total Lamaran</p>
          <p className="text-3xl font-black text-espresso mt-1">{total}</p>
          <p className="text-xs text-espresso-soft mt-1 flex items-center gap-1"><Briefcase size={12} />terkirim</p>
        </div>
        <div className="rounded-2xl bg-white border border-latte p-4">
          <p className="text-xs font-bold tracking-widest text-espresso-soft uppercase">Menunggu</p>
          <p className="text-3xl font-black text-espresso mt-1">{waiting}</p>
          <p className="text-xs text-espresso-soft mt-1">terkirim + dilihat</p>
        </div>
        <div className="rounded-2xl bg-white border border-latte p-4">
          <p className="text-xs font-bold tracking-widest text-espresso-soft uppercase">Diterima</p>
          <p className="text-3xl font-black text-caramel mt-1">{accepted}</p>
          <p className="text-xs text-espresso-soft mt-1 flex items-center gap-1"><CheckCheck size={12} />sedang bekerja</p>
        </div>
        <div className="rounded-2xl bg-espresso text-white p-4">
          <p className="text-xs font-bold tracking-widest text-latte uppercase">Selesai</p>
          <p className="text-3xl font-black mt-1">{done}</p>
          <p className="text-xs text-latte mt-1 flex items-center gap-1"><FlagOff size={12} />bisa dinilai</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-latte overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-latte">
          <h2 className="text-sm font-black text-espresso flex items-center gap-2"><FileText size={16} className="text-caramel" /> Lamaran Terbaru</h2>
          <Link href="/dashboard/barista/applications" className="text-xs font-bold text-caramel hover:underline">Lihat semua</Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-6 text-sm text-espresso-soft">
            Belum ada lamaran. Cari lowongan di bawah dan kirim lamaran pertamamu.
          </p>
        ) : (
          <ul className="divide-y divide-latte">
            {recent.map((a) => {
              const meta = STATUS_META[a.status] ?? STATUS_META.pending;
              return (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-espresso">{a.job_posts?.title ?? "Lowongan dihapus"}</p>
                    <p className="truncate text-xs text-espresso-soft">
                      {a.job_posts?.owners?.business_name ?? "-"} • {relativeTime(a.created_at)}
                    </p>
                  </div>
                  <Badge classes={meta.classes}>{meta.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Search size={16} className="text-caramel" />
        <h2 className="text-sm font-black text-espresso">Cari Lowongan</h2>
      </div>
      <JobFeed myRole={profile?.role ?? null} />
    </div>
  );
}
