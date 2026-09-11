export const metadata = { title: "Visi Misi - BaristaConnect" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs font-bold tracking-widest text-caramel uppercase">Tentang Kami</p>
      <h1 className="mt-1 text-3xl font-black text-espresso">Visi & Misi BaristaConnect</h1>
      <p className="mt-3 text-espresso-soft">Platform jujur untuk barista dan owner — loker transparan, skill dihargai.</p>

      <div className="mt-8 rounded-2xl card-dark p-6 border border-latte">
        <h2 className="font-bold text-espresso">Visi</h2>
        <p className="mt-2 text-sm text-espresso-soft">Menjadi jembatan utama barista & coffee shop di Indonesia — tanpa calo, tanpa loker palsu.</p>
      </div>
      <div className="mt-4 rounded-2xl card-dark p-6 border border-latte">
        <h2 className="font-bold text-espresso">Misi</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-espresso-soft space-y-1">
          <li>Loker real, gaji jelas per shift, lokasi akurat.</li>
          <li>1 profil = CV + cover letter + skill, apply 1-klik.</li>
          <li>Chat langsung owner-barista + AI bantu jawab FAQ.</li>
        </ul>
      </div>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-caramel p-6 text-white">
          <h3 className="font-bold">Manfaat Barista</h3>
          <ul className="mt-2 text-sm space-y-1 opacity-90"><li>• Gratis daftar</li><li>• Profil jadi CV otomatis</li><li>• Apply & notif diterima/ditolak</li><li>• Chat + WA</li></ul>
        </div>
        <div className="rounded-2xl card-dark p-6 border border-latte">
          <h3 className="font-bold text-espresso">Manfaat Owner</h3>
          <ul className="mt-2 text-sm text-espresso-soft space-y-1"><li>• Posting loker gratis</li><li>• Filter barista by skill/lokasi</li><li>• Kelola pelamar + CV</li><li>• Chat & keluarkan jika tidak kerja</li></ul>
        </div>
      </div>
    </div>
  );
}
