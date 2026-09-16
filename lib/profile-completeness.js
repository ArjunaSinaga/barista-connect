// Helper tunggal penghitung kelengkapan Profil Bisnis owner.
// Dipakai server (page.jsx) & diteruskan ke client (sidebar/modal).
// Tambah/kurangi item cukup di sini — persen = terisi/total.
export function getBusinessCompleteness(ownerRow, cafes) {
  const firstCafe = cafes?.[0] ?? null;
  const items = [
    { key: "business_name", label: "Nama usaha", done: !!ownerRow?.business_name, target: "settings" },
    { key: "avatar", label: "Foto profil owner", done: !!ownerRow?.avatar_url, target: "settings" },
    { key: "whatsapp", label: "No HP / WA owner", done: !!ownerRow?.whatsapp, target: "settings" },
    { key: "cafe", label: "Daftarkan 1 cafe", done: (cafes?.length ?? 0) > 0, target: "cafes" },
    { key: "cafe_photo", label: "Foto cafe", done: !!firstCafe?.photo_urls?.length, target: "cafes" },
    { key: "cafe_contact", label: "Alamat / WA cafe", done: !!(firstCafe?.address || firstCafe?.whatsapp), target: "cafes" },
  ];
  const done = items.filter((i) => i.done).length;
  return {
    completeness: Math.round((done / items.length) * 100),
    missing: items.filter((i) => !i.done),
    items,
  };
}
