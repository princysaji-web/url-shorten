-- Organizations + membership for shared link access

create type public.org_role as enum ('admin', 'member');

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create index if not exists organizations_slug_idx on public.organizations (slug);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_members_user_id_idx
  on public.organization_members (user_id);
create index if not exists organization_members_org_id_idx
  on public.organization_members (organization_id);

alter table public.links
  add column if not exists organization_id uuid references public.organizations (id) on delete restrict;

create index if not exists links_organization_id_idx on public.links (organization_id);

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

-- Membership helpers (security definer to avoid RLS recursion)
create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_org_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_org_id
      and m.user_id = auth.uid()
      and m.role = 'admin'
  );
$$;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Organizations policies
create policy "Members and creators can view organizations"
on public.organizations
for select
to authenticated
using (
  public.is_org_member(id)
  or created_by = auth.uid()
);

create policy "Authenticated users can create organizations"
on public.organizations
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Admins can update their organizations"
on public.organizations
for update
to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

grant select, insert, update on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant usage on type public.org_role to authenticated;

-- Members policies
create policy "Members can view org membership"
on public.organization_members
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Users can join as admin when creating an org"
on public.organization_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'admin'
  and exists (
    select 1
    from public.organizations o
    where o.id = organization_id
      and o.created_by = auth.uid()
  )
);

create policy "Admins can insert org members"
on public.organization_members
for insert
to authenticated
with check (public.is_org_admin(organization_id));

create policy "Admins can update org members"
on public.organization_members
for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "Admins can delete org members"
on public.organization_members
for delete
to authenticated
using (public.is_org_admin(organization_id));

-- Replace per-user link policies with org membership
drop policy if exists "Users can view their own links" on public.links;
drop policy if exists "Users can create their own links" on public.links;
drop policy if exists "Users can update their own links" on public.links;
drop policy if exists "Users can view clicks for their links" on public.link_clicks;

create policy "Org members can view org links"
on public.links
for select
to authenticated
using (
  organization_id is not null
  and public.is_org_member(organization_id)
);

create policy "Org members can create org links"
on public.links
for insert
to authenticated
with check (
  created_by = auth.uid()
  and organization_id is not null
  and public.is_org_member(organization_id)
);

create policy "Org members can update org links"
on public.links
for update
to authenticated
using (
  organization_id is not null
  and public.is_org_member(organization_id)
)
with check (
  organization_id is not null
  and public.is_org_member(organization_id)
);

create policy "Org members can view clicks for org links"
on public.link_clicks
for select
to authenticated
using (
  exists (
    select 1
    from public.links
    where links.id = link_clicks.link_id
      and links.organization_id is not null
      and public.is_org_member(links.organization_id)
  )
);

-- Seed default org and migrate existing links/users
insert into public.organizations (name, slug, created_by)
values ('CareStack', 'carestack', null)
on conflict (slug) do nothing;

do $$
declare
  v_org_id uuid;
begin
  select id into v_org_id from public.organizations where slug = 'carestack';

  update public.links
  set organization_id = v_org_id
  where organization_id is null;

  insert into public.organization_members (organization_id, user_id, role)
  select distinct v_org_id, l.created_by, 'admin'::public.org_role
  from public.links l
  where l.created_by is not null
  on conflict (organization_id, user_id) do nothing;

  -- Also attach any existing auth users with no membership yet
  insert into public.organization_members (organization_id, user_id, role)
  select v_org_id, u.id, 'admin'::public.org_role
  from auth.users u
  where not exists (
    select 1
    from public.organization_members m
    where m.user_id = u.id
  )
  on conflict (organization_id, user_id) do nothing;
end;
$$;

-- Require organization_id going forward (after backfill)
alter table public.links
  alter column organization_id set not null;

-- Keep short-code generator reserved names in sync with app routes
create or replace function public.generate_short_code(p_length int default 7)
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_alphabet constant text :=
    '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  v_reserved constant text[] := array[
    'login',
    'dashboard',
    'links',
    'api',
    'auth',
    'organization',
    'organizations',
    'favicon.ico',
    '_next',
    'public'
  ];
  v_result text;
  v_i int;
begin
  if p_length < 4 or p_length > 12 then
    raise exception 'short code length must be between 4 and 12'
      using errcode = '22023';
  end if;

  loop
    v_result := '';

    for v_i in 1..p_length loop
      v_result := v_result || substr(
        v_alphabet,
        1 + floor(random() * length(v_alphabet))::int,
        1
      );
    end loop;

    exit when not (lower(v_result) = any (v_reserved));
  end loop;

  return v_result;
end;
$$;

-- Replace with org-aware signature
drop function if exists public.create_link(text, text, text, text, text, text);

create or replace function public.create_link(
  p_destination_url text,
  p_organization_id uuid,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_term text default null,
  p_utm_content text default null
)
returns public.links
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_link public.links;
  v_short_code text;
  v_attempt int := 0;
  v_max_attempts constant int := 5;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if not public.is_org_member(p_organization_id) then
    raise exception 'Not a member of this organization'
      using errcode = '42501';
  end if;

  loop
    v_attempt := v_attempt + 1;

    if v_attempt > v_max_attempts then
      raise exception 'Could not generate a unique short code'
        using errcode = '23505';
    end if;

    v_short_code := public.generate_short_code();

    begin
      insert into public.links (
        short_code,
        destination_url,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        created_by,
        organization_id
      )
      values (
        v_short_code,
        p_destination_url,
        p_utm_source,
        p_utm_medium,
        p_utm_campaign,
        p_utm_term,
        p_utm_content,
        auth.uid(),
        p_organization_id
      )
      returning * into v_link;

      return v_link;
    exception
      when unique_violation then
        null;
    end;
  end loop;
end;
$$;

grant execute on function public.create_link(
  text,
  uuid,
  text,
  text,
  text,
  text,
  text
) to authenticated;
