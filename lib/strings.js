// Kamus label Bahasa Indonesia — sumber tunggal untuk string UI.
// Tambahkan label baru di sini, jangan hardcode string tampilan di komponen.
export const STR = {
  hero: {
    overlayTop: ["Orang Hebat", "Kopi Mantap"],
    overlayBadge: ["Passion Sama", "Peluang Lebih Besar"],
    strip: "LOKER • BARISTA • TRAINING • KAFE TANGGUH",
    fallback: ["Foto kafe asli tampil di sini.", "Bukan gambar AI."],
    photoAlt: (cafe) => (cafe ? `Foto ${cafe}` : "Foto kafe"),
  },
};
