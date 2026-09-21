---
name: backend-data
description: Router backend + data — schema, migrasi, query, API, webhook, MCP server. Panggil dengan "pakai backend-data" untuk kerjaan database/API.
---

# Backend Data — Router Database & API

Skill pemersatu. Saat aktif, baca SKILL.md yang relevan di bawah sesuai kebutuhan. Jangan baca semuanya sekaligus.

## 1. Schema & migrasi

- `.agents/skills/database-schema-design/SKILL.md` — desain tabel, relasi, index.
- `.agents/skills/database-migration/SKILL.md` — migrasi versioned + rollback.
- `.agents/skills/database-seeding/SKILL.md` — data tes realistis.
- `.agents/skills/database-backup/SKILL.md` — backup + point-in-time recovery.

## 2. Query & optimasi (Postgres/Supabase)

- `.agents/skills/sql-query-generation/SKILL.md` — tulis query baru dari kebutuhan.
- `.agents/skills/query-optimization/SKILL.md` — perbaiki query lambat via EXPLAIN.
- `.opencode/skills/sql-pro/SKILL.md` — join kompleks, window function, CTE.
- `.opencode/skills/database-optimizer/SKILL.md` — index, partitioning, lock.
- `.opencode/skills/postgres-pro/SKILL.md` — JSONB, extension, VACUUM.
- `.opencode/skills/postgres-patterns/SKILL.md` — pola RLS + indexing Supabase.

## 3. API & integrasi

- `.agents/skills/api-design/SKILL.md` — REST: resource, status, pagination.
- `.agents/skills/api-integration/SKILL.md` — klien REST, retry, auth.
- `.agents/skills/graphql-api-design/SKILL.md` — schema GraphQL + DataLoader.
- `.agents/skills/webhook-setup/SKILL.md` — receiver + signature + DLQ.
- `.agents/skills/mcp-server-building/SKILL.md` — bangun MCP server.

## Cara kerja

1. Identifikasi: schema, query, atau API.
2. Baca skill yang sesuai saja; untuk Supabase selalu sertakan postgres-patterns.
3. Standar selesai: migrasi reversible, query ada EXPLAIN bila lambat, RLS terverifikasi.
