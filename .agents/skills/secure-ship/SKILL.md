---
name: secure-ship
description: Router keamanan + review sebelum deploy: audit, threat modeling, SAST/DAST, dependensi, compliance. Panggil dengan "pakai secure-ship" sebelum publish.
---

# Secure Ship — Router Keamanan

Skill pemersatu. Saat aktif, baca SKILL.md yang relevan di bawah sesuai kebutuhan. Jangan baca semuanya sekaligus.

## 1. Audit & review (wajib sebelum deploy)

- `.agents/skills/security-audit/SKILL.md` — audit luas app+infra+identitas.
- `.opencode/skills/security-reviewer/SKILL.md` — review kode, laporan severity.
- `.opencode/skills/secure-code-guardian/SKILL.md` — auth, validasi input, OWASP Top 10.
- `.agents/skills/code-review/SKILL.md` — review umum correctness + maintainability.
- `.agents/skills/skill-supply-chain-audit/SKILL.md` — audit skill/plugin pihak ketiga.

## 2. Testing keamanan spesialis

- `.agents/skills/static-application-security-testing/SKILL.md` — SAST + CI.
- `.agents/skills/dynamic-application-security-testing/SKILL.md` — DAST ke app live.
- `.agents/skills/dependency-scanning/SKILL.md` — CVE + SBOM + lisensi.
- `.agents/skills/license-analysis/SKILL.md` — kompatibilitas lisensi.
- `.agents/skills/penetration-testing-with-strix/SKILL.md` — pentest via Strix.
- `.agents/skills/threat-modeling/SKILL.md` — model ancaman terstruktur.
- `.agents/skills/prompt-injection-defense/SKILL.md` — hardening agen/RAG.
- `.agents/skills/privacy-policy-drafting/SKILL.md` — bahasa privacy policy.
- `.agents/skills/compliance-checklist-generation/SKILL.md` — checklist SOC2/HIPAA/GDPR.

## Cara kerja

1. Sebelum deploy: bagian 1 (audit + review + OWASP).
2. Bagian 2 sesuai risiko: app publik → DAST; agen AI → injection-defense; vendor baru → supply-chain.
3. Standar selesai: temuan severity high = 0, rahasia tidak di file, RLS/policy terverifikasi.
