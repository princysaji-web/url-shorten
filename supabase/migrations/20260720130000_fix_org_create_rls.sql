-- Fix org create: INSERT ... RETURNING / .select() requires SELECT RLS.
-- Creators are not members yet, so allow created_by = auth.uid().

drop policy if exists "Members can view their organizations" on public.organizations;

create policy "Members and creators can view organizations"
on public.organizations
for select
to authenticated
using (
  public.is_org_member(id)
  or created_by = auth.uid()
);

-- Ensure table privileges exist for authenticated clients
grant select, insert, update on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant usage on type public.org_role to authenticated;
