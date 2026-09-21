---
name: hemat-core
description: Router hemat token — selalu aktifkan saat coding: solusi terpendek, tolak over-engineering, konteks secukupnya. Panggil dengan "pakai hemat-core" atau otomatis tiap eksekusi plan.
---

# Hemat Core — Router Hemat Token

Skill pemersatu. Saat aktif, baca SKILL.md yang relevan di bawah sesuai kebutuhan. Jangan baca semuanya sekaligus.

## 1. Nulis dikit (wajib tiap coding)

- `.agents/skills/ponytail/SKILL.md` — solusi paling pendek, YAGNI, stdlib dulu.
- `.opencode/skills/shrinkage/SKILL.md` — extend yang ada, hapus kode mati, diff kecil.
- `.opencode/skills/razor/unused/SKILL.md` — cek dependensi tak terpakai (report-only).

## 2. Audit (dipanggil manual)

- `.agents/skills/ponytail-review/SKILL.md` — review diff: apa yang bisa dihapus.
- `.agents/skills/ponytail-audit/SKILL.md` — audit seluruh repo.

## 3. Konteks (saat konteks membengkak)

- `.agents/skills/context-compression/SKILL.md` — padatkan ke budget token.
- `.agents/skills/context-optimization/SKILL.md` — dedup + urutkan + alokasi budget.
- `.agents/skills/context-retrieval/SKILL.md` — ambil secukupnya dari corpus.
- `.agents/skills/context-ranking/SKILL.md` — skor ulang kandidat konteks.
- `.agents/skills/context-injection/SKILL.md` — sisip konteks aman berlabel.
- `.agents/skills/summarization/SKILL.md` — ringkas transkrip panjang.

## Cara kerja

1. Tiap tugas coding: terapkan bagian 1 otomatis (baca ponytail + shrinkage bila belum di memori sesi ini).
2. Bagian 2 hanya bila user minta audit/review.
3. Bagian 3 hanya bila konteks menipis atau user minta padatkan.
