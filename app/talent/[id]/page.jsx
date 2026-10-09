import BaristaPublicPage from "@/app/barista/[id]/page";

export async function generateMetadata() {
  return { title: "Profil Talenta" };
}

// LP-15: /talent/{id} reuse penuh halaman profil — preview publik,
// aksi lanjutan ikut entitlement di dalam view.
export default BaristaPublicPage;
