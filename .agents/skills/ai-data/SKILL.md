---
name: ai-data
description: Router AI + data — pipeline ML, training, deployment, analisis, visualisasi, RAG. Panggil dengan "pakai ai-data" untuk kerjaan ML/data.
---

# AI Data — Router Machine Learning & Analisis

Skill pemersatu. Saat aktif, baca SKILL.md yang relevan di bawah sesuai kebutuhan. Jangan baca semuanya sekaligus.

## 1. Pipeline & model

- `.agents/skills/ml-pipeline-creation/SKILL.md` — pipeline reproducible aman.
- `.opencode/skills/ml-pipeline/SKILL.md` — orkestrasi, feature store, registry.
- `.agents/skills/model-training/SKILL.md` — training end-to-end + checkpoint.
- `.agents/skills/model-deployment/SKILL.md` — serve model via API/kontainer.
- `.agents/skills/hyperparameter-tuning/SKILL.md` — grid/random/Bayes dalam budget.
- `.opencode/skills/rag-architect/SKILL.md` — RAG: chunk, embedding, vector, rerank.

## 2. Analisis & visualisasi

- `.agents/skills/exploratory-data-analysis/SKILL.md` — profiling awal dataset baru.
- `.agents/skills/data-analysis/SKILL.md` — jawab pertanyaan via statistik.
- `.agents/skills/data-cleaning/SKILL.md` — missing value, duplikat, outlier.
- `.agents/skills/data-labeling/SKILL.md` — anotasi + active learning.
- `.agents/skills/data-visualization/SKILL.md` — chart + dashboard.
- `.agents/skills/knowledge-graph-creation/SKILL.md` — entitas + relasi dari teks.

## Cara kerja

1. Dataset baru → EDA dulu (bagian 2) sebelum modeling.
2. Model → bagian 1 berurutan (pipeline → training → tuning → deploy).
3. Standar selesai: metrik evaluasi tercatat, pipeline reproducible, data validasi terpisah.
