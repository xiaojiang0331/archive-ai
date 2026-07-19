-- Archive AI global, reviewed knowledge library.
-- This intentionally starts without vector embeddings. Add embeddings only after
-- the retrieval model and evaluation set have been selected.

create table if not exists public.knowledge_sources (
  id text primary key,
  authority text not null,
  authority_level text not null,
  title text not null,
  url text not null unique,
  jurisdiction text not null default 'AU',
  topics text[] not null default '{}',
  checked_at date not null,
  review_due date not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_articles (
  id text not null,
  version integer not null default 1,
  title text not null,
  jurisdiction text not null default 'AU',
  topics text[] not null default '{}',
  applicable_roles text[] not null default '{}',
  applicability text,
  summary text not null,
  procedure jsonb not null default '[]'::jsonb,
  evidence_required jsonb not null default '[]'::jsonb,
  source_ids text[] not null,
  effective_from date,
  effective_to date,
  checked_at date not null,
  review_due date not null,
  risk_level text not null,
  human_review_required boolean not null default true,
  reviewer text,
  status text not null default 'draft',
  supersedes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id, version)
);

create index if not exists knowledge_sources_topics_idx
on public.knowledge_sources using gin (topics);

create index if not exists knowledge_articles_topics_idx
on public.knowledge_articles using gin (topics);

create index if not exists knowledge_articles_status_review_due_idx
on public.knowledge_articles (status, review_due);

alter table public.knowledge_sources enable row level security;
alter table public.knowledge_articles enable row level security;

drop policy if exists "Authenticated users can read active knowledge sources"
on public.knowledge_sources;
create policy "Authenticated users can read active knowledge sources"
on public.knowledge_sources
for select
to authenticated
using (status = 'active');

drop policy if exists "Authenticated users can read published knowledge articles"
on public.knowledge_articles;
create policy "Authenticated users can read published knowledge articles"
on public.knowledge_articles
for select
to authenticated
using (status = 'published' and review_due >= current_date);

notify pgrst, 'reload schema';
