create table if not exists public.archives (
  id uuid primary key default gen_random_uuid(),
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

alter table public.archives enable row level security;

drop policy if exists "Allow anonymous archive reads" on public.archives;
create policy "Allow anonymous archive reads"
on public.archives
for select
to anon
using (true);

drop policy if exists "Allow anonymous archive inserts" on public.archives;
create policy "Allow anonymous archive inserts"
on public.archives
for insert
to anon
with check (true);

insert into storage.buckets (id, name, public)
values ('archive-uploads', 'archive-uploads', false)
on conflict (id) do nothing;

drop policy if exists "Allow anonymous archive file uploads" on storage.objects;
create policy "Allow anonymous archive file uploads"
on storage.objects
for insert
to anon
with check (bucket_id = 'archive-uploads');

drop policy if exists "Allow anonymous archive file reads" on storage.objects;
create policy "Allow anonymous archive file reads"
on storage.objects
for select
to anon
using (bucket_id = 'archive-uploads');
