-- Patch: 2 index P0 yang kurang (sudah live via apply_migration)
create index if not exists cafes_name_trgm
  on public.cafes using gin (name gin_trgm_ops);
create index if not exists job_posts_active_created
  on public.job_posts (is_active, created_at desc);
