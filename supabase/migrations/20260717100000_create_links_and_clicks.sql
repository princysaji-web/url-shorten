-- Phase 1: short links + click tracking

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  short_code text not null unique,
  destination_url text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists links_short_code_idx on public.links (short_code);
create index if not exists links_created_by_idx on public.links (created_by);
create index if not exists links_created_at_idx on public.links (created_at desc);
create index if not exists links_is_active_idx on public.links (is_active);

create table if not exists public.link_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links (id) on delete cascade,
  clicked_at timestamptz not null default now(),
  user_agent text,
  referer text
);

create index if not exists link_clicks_link_id_idx on public.link_clicks (link_id);
create index if not exists link_clicks_clicked_at_idx on public.link_clicks (clicked_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists links_set_updated_at on public.links;
create trigger links_set_updated_at
before update on public.links
for each row
execute function public.set_updated_at();

alter table public.links enable row level security;
alter table public.link_clicks enable row level security;

-- Links: owners only
create policy "Users can view their own links"
on public.links
for select
to authenticated
using (created_by = auth.uid());

create policy "Users can create their own links"
on public.links
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Users can update their own links"
on public.links
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Click rows: owners can read counts for their links; inserts via service role only
create policy "Users can view clicks for their links"
on public.link_clicks
for select
to authenticated
using (
  exists (
    select 1
    from public.links
    where links.id = link_clicks.link_id
      and links.created_by = auth.uid()
  )
);
