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

// Blind review: rating satu pihak baru tampil publik setelah pihak lain juga menilai.
// Pasangan diikat via team_member_id yang sama.
export function blindPairs(ownerRatings, cafeRatings) {
  const cafeByTeam = {};
  (cafeRatings ?? []).forEach((r) => { cafeByTeam[r.team_member_id] = r; });
  const ownerByTeam = {};
  (ownerRatings ?? []).forEach((r) => { ownerByTeam[r.team_member_id] = r; });
  return { cafeByTeam, ownerByTeam };
}

export function visibleOwnerRatings(ownerRatings, cafeRatings) {
  const { cafeByTeam } = blindPairs(ownerRatings, cafeRatings);
  return (ownerRatings ?? []).filter((r) => cafeByTeam[r.team_member_id]);
}

export function visibleCafeRatings(ownerRatings, cafeRatings) {
  const { ownerByTeam } = blindPairs(ownerRatings, cafeRatings);
  return (cafeRatings ?? []).filter((r) => ownerByTeam[r.team_member_id]);
}

export function avgStars(ratings) {
  if (!ratings?.length) return null;
  return (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1);
}
