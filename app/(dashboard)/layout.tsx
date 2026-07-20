import { redirect } from "next/navigation";

import { DashboardNav } from "@/components/dashboard/nav";
import { getActiveOrganizationContext } from "@/lib/organizations/context";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { memberships, active } = await getActiveOrganizationContext(user.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DashboardNav
        email={user.email}
        organizations={memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
        }))}
        activeOrganizationId={active?.organization.id ?? null}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
