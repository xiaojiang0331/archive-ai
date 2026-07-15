create table if not exists public.archives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text,
  file_size integer,
  document_type text not null,
  category text not null,
  confidence integer not null,
  status text not null default 'Needs review',
  amount text not null default '$--.--',
  created_at timestamptz not null default now()
);

alter table public.archives
add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists archives_user_id_idx
on public.archives (user_id);

alter table public.archives enable row level security;

drop policy if exists "Allow anonymous archive reads" on public.archives;
drop policy if exists "Allow users to read their own archives" on public.archives;
create policy "Allow users to read their own archives"
on public.archives
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Allow anonymous archive inserts" on public.archives;
drop policy if exists "Allow users to insert their own archives" on public.archives;
create policy "Allow users to insert their own archives"
on public.archives
for insert
to authenticated
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('archive-uploads', 'archive-uploads', false)
on conflict (id) do nothing;

drop policy if exists "Allow anonymous archive file uploads" on storage.objects;
drop policy if exists "Allow users to upload their own archive files" on storage.objects;
create policy "Allow users to upload their own archive files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'archive-uploads'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Allow anonymous archive file reads" on storage.objects;
drop policy if exists "Allow users to read their own archive files" on storage.objects;
create policy "Allow users to read their own archive files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'archive-uploads'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
