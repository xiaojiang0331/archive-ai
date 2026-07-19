-- Archive AI: real vision-analysis persistence and owner-only mutations.
-- Safe to run more than once in the Supabase SQL Editor.

alter table public.archives
add column if not exists analysis_status text not null default 'pending',
add column if not exists analysis_json jsonb,
add column if not exists extracted_text text,
add column if not exists analysis_summary text,
add column if not exists analyzed_at timestamptz,
add column if not exists analysis_error text,
add column if not exists updated_at timestamptz not null default now();

drop policy if exists "Allow users to update their own archives" on public.archives;
create policy "Allow users to update their own archives"
on public.archives
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Allow users to delete their own archives" on public.archives;
create policy "Allow users to delete their own archives"
on public.archives
for delete
to authenticated
using ((select auth.uid()) = user_id);

update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'archive-uploads';

drop policy if exists "Allow users to delete their own archive files" on storage.objects;
create policy "Allow users to delete their own archive files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'archive-uploads'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

notify pgrst, 'reload schema';
