// Helper murni tim (dipakai Server Component — JANGAN pindah ke file "use client").
export function groupTeamByBarista(members) {
  const grouped = [];
  const byBarista = new Map();
  for (const m of members ?? []) {
    if (!byBarista.has(m.barista_id)) {
      const g = { baristaId: m.barista_id, profile: m.barista_profiles, jobs: [] };
      byBarista.set(m.barista_id, g);
      grouped.push(g);
    }
    byBarista.get(m.barista_id).jobs.push(m);
  }
  for (const g of grouped) {
    g.isActive = g.jobs.some((j) => j.status === "active");
    g.memberIds = g.jobs.map((j) => j.id);
  }
  return grouped;
}

export function countTeamByCafe(members) {
  const counts = {};
  for (const m of members ?? []) {
    if (m.cafe_id) counts[m.cafe_id] = (counts[m.cafe_id] ?? 0) + 1;
  }
  return counts;
}
