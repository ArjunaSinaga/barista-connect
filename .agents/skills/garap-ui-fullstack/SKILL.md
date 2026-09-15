---
name: garap-ui-fullstack
description: Panggil skill ini untuk tugas UI/UX, copy gambar jadi kode, analisa kode frontend/backend, atau kerjaan fullstack. Meliputi image-to-code, screenshot-iteration, desain visual, usability, aksesibilitas, review kode, debugging, dan database Supabase.
---

# Garap UI Fullstack — Satu Pintu

Skill pemersatu. Saat skill ini aktif, WAJIB baca dan terapkan semua skill terkait di bawah sesuai jenis tugas. Jangan kerja hanya dari skill ini saja.

## 1. Copy gambar jadi kode (image-to-code)

- `.agents/skills/writing-claude-design-prompts/SKILL.md` — tulis komisi desain dari gambar/screenshot, iterasi berbasis screenshot sampai mirip sumber.
- `.agents/skills/image-to-code/SKILL.md` — konversi gambar langsung jadi kode frontend.
- `.agents/skills/redesign-existing-projects/SKILL.md` — kalau gambar adalah redesign halaman yang sudah ada.

## 2. Desain visual + UX (analisa & implementasi frontend)

- `.agents/skills/ui-visual-composition/SKILL.md` — hierarki, spacing, tipografi, warna, depth.
- `.agents/skills/design-systems-frontend-architecture/SKILL.md` — token, komponen reusable, arsitektur frontend.
- `.agents/skills/interaction-patterns-components/SKILL.md` — pola interaksi & perilaku komponen.
- `.agents/skills/forms-inputs-checkout/SKILL.md` — form, validasi, error, checkout.
- `.agents/skills/information-architecture-navigation/SKILL.md` — navigasi & struktur informasi.
- `.agents/skills/ux-usability-foundations/SKILL.md` — prinsip usability dasar.
- `.agents/skills/ux-writing-content-design/SKILL.md` — microcopy, label, CTA, empty/error state.
- `.agents/skills/accessibility-inclusive-design/SKILL.md` — keyboard flow, screen reader, semantik.
- `.agents/skills/ux-research-discovery-testing/SKILL.md` — riset ringan & usability test.
- `.agents/skills/web-design-guidelines/SKILL.md` — panduan desain web Vercel.
- `.agents/skills/vercel-react-best-practices/SKILL.md` — best practice React/Next.js.
- `.agents/skills/design-taste-frontend/SKILL.md` + `design-taste-frontend-v1` + `high-end-visual-design` + `minimalist-ui` + `stitch-design-taste` + `gpt-taste` — arah rasa visual, anti AI-slop.
- `.agents/skills/frontend-design/SKILL.md` — skill lokal frontend-design yang sudah ada.

## 3. Analisa kode backend + fullstack

- `.agents/skills/systematic-debugging/SKILL.md` — diagnosa bug sistematis frontend & backend.
- `.agents/skills/test-driven-development/SKILL.md` — tulis tes dulu sebelum fix.
- `.agents/skills/requesting-code-review/SKILL.md` + `receiving-code-review` — minta & terima review kode.
- `.agents/skills/code-review/SKILL.md` — review kode umum.
- `.agents/skills/refactoring/SKILL.md` — rapikan kode tanpa ubah perilaku.
- `.agents/skills/supabase/SKILL.md` + `supabase-postgres-best-practices` — query, RLS, indexing, schema.
- `.agents/skills/writing-plans/SKILL.md` + `verification-before-completion` — plan dulu, verifikasi via eksekusi (build ijo + runtime 200).

## Cara kerja

1. Identifikasi jenis tugas: image-to-code, desain/UX, analisa frontend, analisa backend, atau fullstack.
2. Baca SKILL.md yang relevan dari daftar di atas (minimal yang sesuai jenis, idealnya semua yang mirip).
3. Terapkan aturannya berlapis: rasa visual + usability + aksesibilitas + best practice kode + verifikasi eksekusi.
4. Standar selesai: lint bersih, build ijo, runtime 200, screenshot dibandingkan bila dari gambar.
