// Parser seksi terstruktur di dalam description — mirror splitSections di JobPostForm.
// Format: "base...\n\nTanggung Jawab:\n- a\n\nPersyaratan:\n- x\n\nJadwal: ..."
// Dipakai halaman detail agar Tanggung Jawab / Persyaratan tampil seperti mockup UI-06.
export function splitSections(desc) {
  const out = { base: desc ?? "", resp: [], req: [], sched: "" };
  const schedIdx = out.base.lastIndexOf("\nJadwal:");
  if (schedIdx >= 0) {
    out.sched = out.base.slice(schedIdx + "\nJadwal:".length).trim();
    out.base = out.base.slice(0, schedIdx);
  }
  for (const [key, marker] of [["resp", "Tanggung Jawab:"], ["req", "Persyaratan:"]]) {
    const i = out.base.lastIndexOf(`\n${marker}`);
    if (i >= 0) {
      const tail = out.base.slice(i + marker.length + 1);
      const nextMarker = tail.search(/\n(Tanggung Jawab|Persyaratan):/);
      const section = nextMarker >= 0 ? tail.slice(0, nextMarker) : tail;
      out[key] = section.split("\n").map((l) => l.replace(/^-\s*/, "").trim()).filter(Boolean);
      out.base = (out.base.slice(0, i) + (nextMarker >= 0 ? tail.slice(nextMarker) : "")).trim();
    }
  }
  out.base = out.base.trim();
  return out;
}
