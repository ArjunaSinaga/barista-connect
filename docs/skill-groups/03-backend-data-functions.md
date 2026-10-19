# Backend + Data — Sub-grup Fungsi Spesifik

> Pointer saja. Router: `backend-data`. Load 1 skill per prompt.

## supabase-spesifik
- `supabase` — SEMUA produk: DB, Auth, Edge Function, Realtime, Storage, debug error
- `supabase-postgres-best-practices` — WAJIB sebelum tulis/ubah apa pun yang hidup di Postgres
- `baristaconnect` — 1 pintu proyek kerja.inc (system design + semua relevan)

## skema-tabel
- `postgresql-table-design` — desain skema Postgres: tipe, constraint, pola performa
- `database-schema-design` — desain skema umum: tabel, relasi, index
- `database-migration` — migrasi zero-downtime + rollback
- `database-seeding` — data uji realistis + reproducible
- `database-backup` — backup full/incremental/PITR + verifikasi

## query-performa
- `postgres-patterns` — pola query, RLS, indexing gaya Supabase
- `postgres-pro` — EXPLAIN, JSONB, extension, VACUUM, replikasi
- `sql-pro` — join kompleks, window function, CTE, benchmark before/after
- `sql-optimization-patterns` — optimasi + EXPLAIN + strategi index
- `sql-query-generation` — tulis query BARU dari kebutuhan bisnis
- `query-optimization` — perbaiki query LAMBAT yang sudah ada
- `database-optimizer` — investigasi slow query + tuning config + partisi

## api-desain
- `api-design` — REST: resource, status code, pagination, versioning
- `api-design-principles` — prinsip REST + GraphQL intuitif + standar tim
- `api-integration` — konsumsi REST pihak ketiga + webhook consumer + retry
- `graphql-api-design` — skema GraphQL + DataLoader + federation
- `graphql-architect` — implementasi Apollo Federation + subscription realtime
- `webhook-setup` — receiver webhook + idempotency + retry + DLQ
- `mcp-server-building` — desain MCP server: kontrak tool, least-privilege, transport
- `mcp-developer` — implementasi/debug MCP server-client (TS/Python SDK)
- `tool-schema-design` — skema tool function-calling: nama, param, side effect

## arsitektur-backend
- `architecture-patterns` — Clean/Hexagonal/DDD
- `microservices-patterns` — service boundary, event-driven, resilience
- `microservices-architect` — dekomposisi monolit + saga + tracing
- `multi-tenant-architecture` — isolasi tenant, custom domain, plan limit
- `workflow-orchestration-patterns` — Temporal: workflow vs activity, saga
- `multi-cloud-architecture` — pilih layanan AWS/Azure/GCP anti-lock-in
- `hybrid-cloud-networking` — VPN/koneksi on-prem ↔ cloud

## framework-backend (pilih 1 sesuai stack)
- `fastapi-expert` / `fastapi-templates` — API async Python + Pydantic V2
- `django-expert` — Django + DRF + ORM select/prefetch
- `laravel-specialist` — Laravel 10+ Eloquent/Sanctum/Livewire/Pest
- `rails-expert` — Rails 7 Hotwire/Sidekiq/RSpec
- `nestjs-expert` — NestJS module/guard/interceptor + Prisma/TypeORM
- `nodejs-backend-patterns` — Express/Fastify + middleware + auth + DB
- `spring-boot-engineer` — Spring Boot 3 JPA/Security 6/WebFlux
- `dotnet-core-expert` — .NET 8 minimal API + EF Core + MediatR
- `php-pro` — PHP 8.3 strict + PHPStan 9 + Laravel/Symfony
- `golang-pro` — Go concurrency, gRPC, CLI, benchmark
- `rust-engineer` — ownership/lifetime, tokio async, FFI
- `kotlin-specialist` — coroutine/Flow, KMP, Ktor, Compose
- `swift-expert` — iOS/macOS SwiftUI + actor + Combine/Vapor
- `java-architect` — Spring Boot 3 WebFlux + Security OAuth2/JWT
- `python-pro` — Python 3.11 typing + async + pytest + mypy strict
- `typescript-pro` — generics/mapped type + tRPC full-stack
- `javascript-pro` — ES2023+ async + ESM + Node API
- `typescript-advanced-types` — conditional/mapped/template-literal types
- `modern-javascript-patterns` — async/await, destructuring, FP pattern
- `cpp-pro` — C++20/23 concepts/ranges/coroutine + CMake
- `csharp-developer` — ASP.NET Core + Blazor + EF Core
- `flutter-expert` — Flutter 3 Riverpod/Bloc + GoRouter
- `react-native-expert` — (lihat UI edit-aman)
- `vue-expert` / `vue-expert-js` — Vue 3 Composition (TS / JS-only)
- `angular-architect` / `angular-migration` — Angular 17+ standalone/signal / migrasi JS
- `embedded-systems` — firmware STM32/ESP32, FreeRTOS, DMA, interrupt
- `game-developer` — Unity/Unreal ECS, fisika, multiplayer, shader
- `shopify-expert` — Liquid, Hydrogen, checkout extension, Functions
- `wordpress-pro` — tema/plugin, Gutenberg, WooCommerce, hardening
- `salesforce-developer` — Apex, LWC, SOQL, trigger, DX CI/CD
- `solidity-security` — kontrak aman + pola anti-vuln
- `defi-protocol-templates` — staking, AMM, governance, lending
- `nft-standards` — ERC-721/1155 + metadata + marketplace
- `meme-coin-audit` — rug-pull detection, SPL/Token-2022, LP drain
- `web3-testing` — Hardhat/Foundry + mainnet fork
- `web3-audit` — 10 kelas bug DeFi + kill signal + PoC Foundry
- `spark-engineer` — Spark DataFrame/SQL, shuffle tune, streaming
- `pandas-pro` — DataFrame join/pivot/resample/optimasi
- `ml-pipeline` — Kubeflow/Airflow/MLflow + feature store Feast
- `async-python-patterns` — asyncio + concurrent non-blocking
- `bash-defensive-patterns` — skrip bash production-grade fault-tolerant
- `bats-testing-patterns` — testing skrip shell via Bats + TDD
- `shellcheck-configuration` — lint shell + portabilitas
- `error-handling-patterns` — exception/Result/graceful degradation
- `python-packaging` — struktur paket + PyPI publish
- `python-performance-optimization` — cProfile + memory profiler
- `uv-package-manager` — dep Python cepat via uv + venv
- `monorepo-management` — Turborepo/Nx/pnpm workspace
- `cli-developer` — CLI: parsing flag, progress, completion shell
- `scaffold-cli` — scaffold CLI TS + tsdown + changesets + publish
- `websocket-engineer` — WebSocket/Socket.IO + Redis scale + presence
- `chatbot-conversation-design` — (lihat UI struktur-alur)
- `billing-automation` — recurring payment + invoicing + dunning
- `paypal-integration` / `stripe-integration` — checkout + subscription + refund
- `legacy-modernizer` — strangler fig + peta dependensi + roadmap migrasi
- `spec-miner` — reverse-engineer codebase legacy jadi spek
- `refactoring` — code smell + pola refactor (lihat quality)
- `codebase-architecture` — kontrak modul + guardrail repo
- `planning` — rencana eksekusi + vertical slice + kriteria verifikasi
- `multi-agent-orchestration` — dekomposisi multi-agen + handoff contract
- `atlassian-mcp` — Jira JQL + Confluence CQL + sprint via MCP
- `deploy-to-vercel` — deploy app + preview link
- `cloudflare-tunnel` — expose dev lokal via tunnel publik (.opencode)
- `cloud-architect` — arsitektur cloud + migrasi + DR (.opencode)
- `cost-optimization` — rightsizing + tagging + reserved instance
- `cloud-monitoring` — metric/log/trace observability cloud
- `task-automation` — skrip + scheduler + polling API anti-toil
- `file-organization` — rapikan file per aturan + dedup + arsip
- `task-observer` — pantau eksekusi + tangkap peluang skill baru
- `chat-history` — gali keputusan/fix lama dari chat lampau
- `book-to-skill` — ubah buku/dokumen jadi skill agen
- `skill-creator` / `agent-skills-creator` — bikin/edit skill + benchmark
- `agents-md` — audit/edit AGENTS.md + migrasi CLAUDE.md
- `ozemp` — kompres skill token-hemat (via router saja)
- `ceo-thinking` — lensa CEO: strategi, trade-off, ROI, risiko
- `project-management` — task/sprint/status + Jira/Linear/GH
- `feature-forge` — user story, EARS, PRD, acceptance (.opencode)

## tambahan-2026-10-13 (baru diinstall)
- caching: `redis-core`, `redis-connections`, `redis-clustering`, `redis-search`, `redis-security`, `redis-semantic-cache`, `redis-observability` (resmi Redis)
- search: `elasticsearch-onboarding`, `elasticsearch-esql`, `elasticsearch-index-design`, `elasticsearch-query-optimization`, `elasticsearch-search-relevance`, `elasticsearch-ingest`, `elasticsearch-reindex`, `elasticsearch-cluster-health`, `elasticsearch-anomaly-detection*` (resmi Elastic)
- queue: developing-kafka-python-client (Confluent, coba lagi bila perlu), `pactflow` contract-testing juga menutup testing API
- queue (batch-2 DONE): `developing-kafka-python-client`, `developing-kafka-java-client`, `kafka-schema-registry`, `kafka-streams-programming`, `confluent-cloud-flink-sql`, `confluent-cloud-cdc-tableflow`, `confluent-tuning-advisor` (resmi Confluent)
