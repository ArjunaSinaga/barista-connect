-- ============================================================
-- BaristaConnect - Full database schema
-- Run once: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Enums ----------
do $$ begin
  create type app_role as enum ('owner', 'barista');
exception when duplicate_object then null; end $$;

do $$ begin
  create type employment_type as enum ('full_time', 'part_time', 'casual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('pending', 'viewed', 'accepted', 'rejected');
exception when duplicate_object then null; end $$;

-- ---------- Tables ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       app_role not null,
  email      text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.owners (
  id            uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null check (char_length(business_name) between 2 and 120),
  location      text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.barista_profiles (
  id                  uuid primary key references public.profiles (id) on delete cascade,
  full_name           text not null,
  age                 int not null check (age between 15 and 90),
  location_place      text not null,
  profile_picture_url text not null,
  years_of_experience int not null default 0 check (years_of_experience >= 0),
  skills              text[] not null default '{}',
  certificates        text[] not null default '{}',
  ideas_plus          text default '',
  is_open_to_work     boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.job_posts (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.owners (id) on delete cascade,
  title           text not null check (char_length(title) between 5 and 120),
  description     text default '',
  location        text not null,
  employment_type employment_type not null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  job_post_id uuid not null references public.job_posts (id) on delete cascade,
  barista_id  uuid not null references public.barista_profiles (id) on delete cascade,
  message     text default '',
  status      application_status not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (job_post_id, barista_id)
);

create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.owners (id) on delete cascade,
  barista_id  uuid not null references public.barista_profiles (id) on delete cascade,
  job_post_id uuid references public.job_posts (id) on delete set null,
  needs_human boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (owner_id, barista_id)
);

create table if not exists public.messages (
  id              bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id),
  body            text not null check (char_length(body) <= 2000),
  is_ai           boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ---------- Indexes ----------
create index if not exists idx_barista_skills on public.barista_profiles using gin (skills);
create index if not exists idx_barista_location on public.barista_profiles (location_place);
create index if not exists idx_barista_open on public.barista_profiles (is_open_to_work);
create index if not exists idx_jobs_feed on public.job_posts (is_active, created_at desc);
create index if not exists idx_jobs_owner on public.job_posts (owner_id);
create index if not exists idx_apps_job on public.applications (job_post_id);
create index if not exists idx_apps_barista on public.applications (barista_id);
create index if not exists idx_msg_conv on public.messages (conversation_id, created_at);
create index if not exists idx_conv_owner on public.conversations (owner_id);
create index if not exists idx_conv_barista on public.conversations (barista_id);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end $fn$;

drop trigger if exists trg_barista_updated on public.barista_profiles;
create trigger trg_barista_updated before update on public.barista_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_job_updated on public.job_posts;
create trigger trg_job_updated before update on public.job_posts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_app_updated on public.applications;
create trigger trg_app_updated before update on public.applications
  for each row execute function public.set_updated_at();

-- ---------- Helper RPC ----------
-- Stable thread per (owner, barista). Caller must be one of the pair.
create or replace function public.get_or_create_conversation(
  p_owner uuid,
  p_barista uuid,
  p_job uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $rpc$
declare
  cid uuid;
begin
  if auth.uid() is null or auth.uid() not in (p_owner, p_barista) then
    raise exception 'NOT_PARTICIPANT';
  end if;

  select c.id into cid
  from public.conversations c
  where c.owner_id = p_owner and c.barista_id = p_barista
  limit 1;

  if cid is null then
    insert into public.conversations (owner_id, barista_id, job_post_id)
    values (p_owner, p_barista, p_job)
    returning id into cid;
  elsif p_job is not null then
    update public.conversations
       set job_post_id = p_job
     where id = cid and job_post_id is null;
  end if;

  return cid;
end $rpc$;

grant execute on function public.get_or_create_conversation(uuid, uuid, uuid) to authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.owners enable row level security;
alter table public.barista_profiles enable row level security;
alter table public.job_posts enable row level security;
alter table public.applications enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- profiles: owner-only rows
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

-- owners: public read (job feed shows business names)
drop policy if exists owners_public_read on public.owners;
create policy owners_public_read on public.owners
  for select using (true);

drop policy if exists owners_write_own on public.owners;
create policy owners_write_own on public.owners
  for insert with check (
    auth.uid() = id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'owner'
    )
  );

drop policy if exists owners_update_own on public.owners;
create policy owners_update_own on public.owners
  for update using (auth.uid() = id);

-- barista_profiles: public read (directory + public profile page)
drop policy if exists barista_public_read on public.barista_profiles;
create policy barista_public_read on public.barista_profiles
  for select using (true);

drop policy if exists barista_insert_own on public.barista_profiles;
create policy barista_insert_own on public.barista_profiles
  for insert with check (
    auth.uid() = id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'barista'
    )
  );

drop policy if exists barista_update_own on public.barista_profiles;
create policy barista_update_own on public.barista_profiles
  for update using (auth.uid() = id);

-- job_posts: anon sees active only; owner sees own incl. paused
drop policy if exists jobs_public_read_active on public.job_posts;
create policy jobs_public_read_active on public.job_posts
  for select using (
    is_active = true
    or exists (select 1 from public.owners o where o.id = auth.uid())
  );

drop policy if exists jobs_insert_own on public.job_posts;
create policy jobs_insert_own on public.job_posts
  for insert with check (
    exists (
      select 1 from public.owners o
      join public.profiles p on p.id = o.id
      where o.id = auth.uid() and p.role = 'owner'
    )
  );

drop policy if exists jobs_update_own on public.job_posts;
create policy jobs_update_own on public.job_posts
  for update using (
    exists (select 1 from public.owners o where o.id = auth.uid())
  );

drop policy if exists jobs_delete_own on public.job_posts;
create policy jobs_delete_own on public.job_posts
  for delete using (
    exists (select 1 from public.owners o where o.id = auth.uid())
  );

-- applications: applicant sees own; job owner sees all for their jobs
drop policy if exists apps_select_parties on public.applications;
create policy apps_select_parties on public.applications
  for select using (
    exists (
      select 1 from public.barista_profiles b
      where b.id = auth.uid() and b.id = barista_id
    )
    or exists (
      select 1 from public.job_posts j
      where j.id = job_post_id and j.owner_id = auth.uid()
    )
  );

drop policy if exists apps_insert_barista on public.applications;
create policy apps_insert_barista on public.applications
  for insert with check (
    exists (
      select 1 from public.barista_profiles b
      where b.id = auth.uid() and b.id = barista_id
    )
    and exists (
      select 1 from public.job_posts j
      where j.id = job_post_id and j.is_active = true
    )
  );

drop policy if exists apps_update_parties on public.applications;
create policy apps_update_parties on public.applications
  for update using (
    exists (
      select 1 from public.job_posts j
      where j.id = job_post_id and j.owner_id = auth.uid()
    )
    or (
      exists (
        select 1 from public.barista_profiles b
        where b.id = auth.uid() and b.id = barista_id
      )
      and status = 'pending'
    )
  );

-- conversations: participants only
drop policy if exists conv_select_participants on public.conversations;
create policy conv_select_participants on public.conversations
  for select using (auth.uid() in (owner_id, barista_id));

drop policy if exists conv_update_participants on public.conversations;
create policy conv_update_participants on public.conversations
  for update using (auth.uid() in (owner_id, barista_id));

-- messages: participants read; sender must be participant
drop policy if exists msg_select_participants on public.messages;
create policy msg_select_participants on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() in (c.owner_id, c.barista_id)
    )
  );

drop policy if exists msg_insert_participant on public.messages;
create policy msg_insert_participant on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() in (c.owner_id, c.barista_id)
    )
  );

-- ============================================================
-- Realtime: broadcast new messages to subscribed clients
-- ============================================================
do $rt$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $rt$;

-- ============================================================
-- Storage: avatars bucket (public read, user-scoped write)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_user_insert on storage.objects;
create policy avatars_user_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_user_update on storage.objects;
create policy avatars_user_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
