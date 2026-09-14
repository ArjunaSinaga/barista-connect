<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file''s directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Deploy Rule
## Shared Memory (personal use - non-isolated)

Workspace ini dipakai pribadi oleh satu user. Jangan perlakukan tiap chat/page sebagai terisolasi.
- Di AWAL setiap sesi: baca `memory/MEMORY.md` saja (single source).
- Di AKHIR setiap prompt yang selesai dikerjakan: langsung update delta penting ke `memory/MEMORY.md` (keputusan, progress, error, next step). Hanya delta, bukan verbatim. Jangan nunggu akhir sesi besar.
- Jika user bilang "lanjutkan dari sebelah", minta paste ringkasan/error/code bila belum ada di memory, lalu sambung dari situ.