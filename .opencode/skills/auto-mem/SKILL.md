---
name: auto-mem
description: Background Claude Mem auto-sync - setiap obrolan auto ingat & update tentang user tanpa ganggu chat. Trigger tiap akhir turn/session.
---

# Auto-Mem Background Sync

Jalan di balik layar. Setiap akhir obrolan:

1. Ringkas sari penting (preferensi baru, keputusan, mood, config) - bukan verbatim.
2. `memory_add_observations` ke `Arjuna Rahman Maulana Sinaga` + entitas terkait (Barista Connect monetization plan jika relevan).
3. Filter sensitif: skip API key mentah, NCII detail grafis, data privat.
4. Tab lain auto-load via `memory_search_nodes` / `memory_read_graph` di awal session.

Aturan:
- Silent, tidak interrupt chat.
- Hanya delta (hal baru), tidak duplikasi.
- Jika user bilang "jangan simpan", skip.
