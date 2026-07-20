-- Allow org members to delete shared links
create policy "Org members can delete org links"
on public.links
for delete
to authenticated
using (
  organization_id is not null
  and public.is_org_member(organization_id)
);
