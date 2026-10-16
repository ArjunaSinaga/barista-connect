import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient, getSessionSafe, isSupabaseConfigured } from "@/lib/supabase/server";
import NotifList from "@/components/barista/NotifList";

export const metadata = { title: "Notifikasi" };

// EMAPP-25: pusat notifikasi — riwayat update rekrutmen terbaru-dulu.
export default async function NotifikasiPage() {
  const { profile } = await getSessionSafe();
  if (!isSupabaseConfigured() || profile?.role !== "barista") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState icon={<FileText size={22} />} title="Khusus barista" subtitle="Halaman ini hanya untuk akun barista." actionLabel="Ke Jobs" actionHref="/jobs" />
      </div>
    );
  }

  let items = [];
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select("id,title,body,is_read,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      items = data ?? [];
    }
  } catch { items = []; }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 py-8">
      <p className="text-xs font-bold tracking-widest text-caramel uppercase">Pusat Notifikasi</p>
      <h1 className="mt-1 text-2xl font-black text-espresso" style={{ fontFamily: "Fraunces, Georgia, serif" }}>Notifikasi</h1>
      <p className="mt-1 text-sm text-espresso-soft">
        Semua update terkait lamaran, interview, dan aktivitas akun Anda.
      </p>
      <div className="mt-5">
        <NotifList items={items} />
      </div>
    </div>
  );
}
