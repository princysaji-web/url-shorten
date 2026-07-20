import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import type {
  Organization,
  OrgRole,
} from "@/lib/supabase/database.types";

export const ACTIVE_ORG_COOKIE = "active_org_id";

export type MembershipWithOrg = {
  id: string;
  role: OrgRole;
  organization: Organization;
};

export function slugifyOrgName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function listUserMemberships(
  userId: string,
): Promise<MembershipWithOrg[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select(
      "id, role, organization:organizations!inner(id, name, slug, created_by, created_at, updated_at)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.flatMap((row) => {
    const organization = row.organization as Organization | Organization[] | null;
    const org = Array.isArray(organization) ? organization[0] : organization;
    if (!org) {
      return [];
    }
    return [
      {
        id: row.id,
        role: row.role,
        organization: org,
      },
    ];
  });
}

export async function getActiveOrganizationContext(userId: string): Promise<{
  memberships: MembershipWithOrg[];
  active: MembershipWithOrg | null;
}> {
  const memberships = await listUserMemberships(userId);
  if (memberships.length === 0) {
    return { memberships, active: null };
  }

  const cookieStore = await cookies();
  const cookieOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const active =
    memberships.find((m) => m.organization.id === cookieOrgId) ??
    memberships[0];

  return { memberships, active };
}

export async function requireActiveOrg(userId: string) {
  const context = await getActiveOrganizationContext(userId);
  if (!context.active) {
    return { ...context, active: null as null };
  }
  return context;
}
