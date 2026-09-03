-- Perfection F1: multi-type, CV wajib, WA, maps zero-cost, gaji free+panggilan format validation at app layer
-- Run via Supabase Dashboard > SQL Editor

-- owners: WA + maps (OSM Leaflet/Nominatim zero-cost)
alter table public.owners add column if not exists whatsapp text check (whatsapp is null or char_length(whatsapp) between 8 and 20);
alter table public.owners add column if not exists address text;
alter table public.owners add column if not exists lat double precision check (lat is null or (lat between -90 and 90));
alter table public.owners add column if not exists lng double precision check (lng is null or (lng between -180 and 180));
alter table public.owners add column if not exists business_type text default 'coffee_shop';

-- barista_profiles: CV PDF wajib + cover wajib + multi tipe + WA for owner WA link
alter table public.barista_profiles add column if not exists whatsapp text check (whatsapp is null or char_length(whatsapp) between 8 and 20);
alter table public.barista_profiles add column if not exists cv_url text;
alter table public.barista_profiles add column if not exists cover_letter text;
alter table public.barista_profiles add column if not exists open_to_types employment_type[] not null default '{}';
create index if not exists idx_barista_open_types on public.barista_profiles using gin (open_to_types);

-- job_posts: multi-select tipe kerja + gaji teks bebas (panggilan "<nominal>/shift" validated in app)
alter table public.job_posts add column if not exists employment_types employment_type[] not null default '{}';
alter table public.job_posts add column if not exists salary_text text;
-- backfill from legacy single column
update public.job_posts set employment_types = array[employment_type] where employment_types = '{}' and employment_type is not null;
create index if not exists idx_jobs_types on public.job_posts using gin (employment_types);

-- applications: CV + cover + selected tipe (barista picks among offered)
alter table public.applications add column if not exists cv_url text;
alter table public.applications add column if not exists cover_letter text;
alter table public.applications add column if not exists employment_types employment_type[] not null default '{}';
-- legacy message column stays for backwards compat

-- storage: cvs bucket (private, 5MB, PDF only) + existing avatars keep
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array['application/pdf'])
on conflict (id) do update set file_size_limit=5242880, allowed_mime_types=array['application/pdf'];

drop policy if exists cvs_owner_read on storage.objects;
create policy cvs_owner_read on storage.objects for select to authenticated using (bucket_id='cvs' and ((storage.foldername(name))[1]=auth.uid()::text or exists (select 1 from public.job_posts j join public.applications a on a.job_post_id=j.id where j.owner_id=auth.uid() and a.cv_url like '%'||name)));
drop policy if exists cvs_user_insert on storage.objects;
create policy cvs_user_insert on storage.objects for insert to authenticated with check (bucket_id='cvs' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists cvs_user_update on storage.objects;
create policy cvs_user_update on storage.objects for update to authenticated using (bucket_id='cvs' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists cvs_user_delete on storage.objects;
create policy cvs_user_delete on storage.objects for delete to authenticated using (bucket_id='cvs' and (storage.foldername(name))[1]=auth.uid()::text);
