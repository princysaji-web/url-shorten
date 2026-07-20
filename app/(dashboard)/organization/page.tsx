import { redirect } from "next/navigation";

import { AddMemberForm } from "@/components/organizations/add-member-form";
import { MemberActions } from "@/components/organizations/member-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getActiveOrganizationContext } from "@/lib/organizations/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { active } = await getActiveOrganizationContext(user.id);
  if (!active) {
    redirect("/dashboard");
  }

  const orgId = active.organization.id;
  const isAdmin = active.role === "admin";

  const { data: members } = await supabase
    .from("organization_members")
    .select("id, user_id, role, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });

  const memberRows = members ?? [];
  const emailByUserId = new Map<string, string>();

  try {
    const admin = createAdminClient();
    const { data: usersData } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    for (const authUser of usersData.users) {
      if (authUser.email) {
        emailByUserId.set(authUser.id, authUser.email);
      }
    }
  } catch {
    // Fall back to showing user ids if admin client is unavailable
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {active.organization.name}
        </h1>
        <p className="text-muted-foreground">
          Slug: {active.organization.slug} · Your role: {active.role}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Shared access to this organization&apos;s links. Admins can add or
            remove people here — no email invite link required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAdmin ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h2 className="mb-3 text-sm font-medium">Add member</h2>
              <AddMemberForm organizationId={orgId} />
            </div>
          ) : null}

          <ul className="divide-y rounded-md border">
            {memberRows.map((member) => (
              <li
                key={member.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {emailByUserId.get(member.user_id) ?? member.user_id}
                  </p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {member.role}
                    {member.user_id === user.id ? " · you" : ""}
                  </p>
                </div>
                <MemberActions
                  organizationId={orgId}
                  memberId={member.id}
                  role={member.role}
                  canManage={isAdmin}
                  isSelf={member.user_id === user.id}
                />
              </li>
            ))}
            {memberRows.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted-foreground">
                No members yet.
              </li>
            ) : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
