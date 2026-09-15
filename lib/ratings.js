// Helper rating murni (tanpa "use client") — aman diimpor Server Component
// maupun Client Component. Jangan taruh di file "use client": memanggil
// fungsi dari modul klien di server melempar 500 (RSC tidak mengizinkan).

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function nextEditableAt(updatedAt) {
  return new Date(new Date(updatedAt).getTime() + WEEK_MS);
}

export function canEdit(updatedAt) {
  if (!updatedAt) return true;
  return Date.now() - new Date(updatedAt).getTime() >= WEEK_MS;
}

// Blind review DIMATIKAN (2026-09-15): rating tampil segera setelah satu
// pihak menilai, tanpa menunggu balasan pihak lain. blindPairs dipertahankan
// untuk kompatibilitas tapi tidak lagi dipakai untuk filter.
export function blindPairs(ownerRatings, cafeRatings) {
  const cafeByTeam = {};
  (cafeRatings ?? []).forEach((r) => { cafeByTeam[r.team_member_id] = r; });
  const ownerByTeam = {};
  (ownerRatings ?? []).forEach((r) => { ownerByTeam[r.team_member_id] = r; });
  return { cafeByTeam, ownerByTeam };
}

export function visibleOwnerRatings(ownerRatings) {
  return ownerRatings ?? [];
}

export function visibleCafeRatings(ownerRatings, cafeRatings) {
  return cafeRatings ?? [];
}

export function avgStars(ratings) {
  if (!ratings?.length) return null;
  return (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1);
}
