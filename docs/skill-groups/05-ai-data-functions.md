# AI + Data — Sub-grup Fungsi Spesifik

> Pointer saja. Router: `ai-data`. Load 1 skill per prompt.

## riset-fakta
- `deep-research` — riset multi-langkah + sintesis laporan
- `fact-checking` — verifikasi klaim + skor confidence per asersi
- `literature-review` — review akademik: strategi cari + kriteria inklusi
- `book-to-skill` — ubah buku/dokumen jadi skill agen

## analisis-data
- `data-analysis` — jawab pertanyaan via statistik + uji hipotesis
- `exploratory-data-analysis` — profiling awal dataset baru
- `data-visualization` — chart/dashboard matplotlib/seaborn/plotly
- `spreadsheet-analysis` — inspeksi xlsx/csv: formula, pivot, rekonsiliasi
- `data-cleaning` — missing value, dedup, tipe, outlier, validasi
- `data-labeling` — workflow anotasi + active learning + weak supervision
- `knowledge-graph-creation` — entitas + relasi + triple dari teks

## data-bisnis
- `crm-data-enrichment` — perkaya record CRM firmografi/kontak
- `lead-scoring` — skor + tier prospek untuk sales
- `churn-analysis` — skor risiko churn + rekomendasi intervensi
- `customer-feedback-analysis` — tema NPS/CSAT + laporan insight
- `financial-modeling` — proyeksi P&L, DCF, valuasi
- `financial-report-generation` — balance sheet, cash flow, ringkasan eksekutif
- `invoice-processing` — ekstrak + validasi invoice vs PO/GL
- `expense-categorization` — klasifikasi biaya + deductibility pajak
- `budget-planning` — budget + variance + alokasi departemen

## ml-pipeline
- `ml-pipeline-creation` — pipeline reproduksibel: prep→latih→eval→registry→deploy gate
- `ml-pipeline-workflow` — MLOps end-to-end + retraining otomatis
- `ml-pipeline` — Kubeflow/Airflow/MLflow + Feast (.opencode)
- `model-training` — latih end-to-end: loader, arsitektur, checkpoint
- `model-deployment` — sajikan model: REST, container, serverless
- `hyperparameter-tuning` — grid/random/Bayes/Hyperband dalam budget compute
- `fine-tuning-expert` — LoRA/QLoRA, dataset JSONL, DPO/RLHF (.opencode)

## llm-rag
- `rag-architect` — RAG produksi: chunk, embedding, vector store, rerank (.opencode)
- `rag-implementation` — RAG + vector DB + semantic search
- `langchain-architecture` — agen LangChain + memory + tool
- `llm-evaluation` — evaluasi LLM: metrik otomatis + human feedback + benchmark
- `prompt-engineering-patterns` — optimasi prompt produksi + template
- `prompt-engineer` — desain prompt + CoT/few-shot + evaluasi (.opencode)
- `tool-schema-design` — skema tool function-calling yang aman
- `chatbot-conversation-design` — intent, slot filling, fallback
- `human-in-the-loop` — approval gate + anti-rubber-stamp
- `context-retrieval` / `context-ranking` / `context-compression` / `context-optimization` / `context-injection` — cari, skor, padatkan, susun, sisip konteks
- `summarization` — ringkas ekstraktif/abstraktif/hierarkis
- `knowledge-base-article-writing` — artikel bantuan dari data support
- `ticket-triage` — klasifikasi + prioritas + respons awal tiket

## gambar-ai
- `ai-drawing-director` — prompt fotorealistik + adaptasi SD/Midjourney/Flux/Gemini
- `sns-realistic-portrait-prompt` — prompt potret SNS low-AI-look (EN/JSON)

## orkestrasi-agen
- `multi-agent-orchestration` — dekomposisi + dependency graph + handoff
- `agent-red-teaming` — red-team agen: injection, agency berlebih, batas tool
- `task-observer` — tangkap peluang skill baru saat eksekusi

## tambahan-2026-10-13 (baru diinstall)
- data-pipeline: `answering-natural-language-questions-with-dbt`, `building-dbt-semantic-layer`, `using-dbt-mesh`, `using-dbt-state`, `using-dbt-for-analytics-engineering`, `adding-dbt-unit-test`, `troubleshooting-dbt-job-errors`, `upgrading-dbt`, `migrating-dbt-*`, `configuring-dbt-mcp-server`, `creating-mermaid-dbt-dag`, `fetching-dbt-docs`, `maintaining-dbt-documentation`, `querying-the-dbt-information-schema`, `running-dbt-commands` (resmi dbt-labs)
- orkestrasi-agen (batch-2 DONE): `check-crewai-api`, `test-crewai-project` (resmi CrewAI)
- eval-harness (batch-2 DONE): `demo-reviewer` + pola A/B skill (adewale/skill-eval-harness, sx4im/skillcheck)
