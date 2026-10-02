-- P0: pg_trgm search index (ringankan LIKE %q% saat >10k row)
create extension if not exists pg_trgm;

create index if not exists job_posts_title_trgm
  on public.job_posts using gin (title gin_trgm_ops);
create index if not exists job_posts_desc_trgm
  on public.job_posts using gin (description gin_trgm_ops);
create index if not exists job_posts_loc_trgm
  on public.job_posts using gin (location gin_trgm_ops);
create index if not exists job_posts_active_created
  on public.job_posts (is_active, created_at desc);
