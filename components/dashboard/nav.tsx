"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { Building2, Link2, LayoutDashboard, Plus } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { setActiveOrganization } from "@/app/actions/organizations";
import { FullPageLoader } from "@/components/full-page-loader";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/links/new", label: "Create Link", icon: Plus },
  { href: "/organization", label: "Organization", icon: Building2 },
];

export type NavOrganization = {
  id: string;
  name: string;
  slug: string;
};

export function DashboardNav({
  email,
  organizations,
  activeOrganizationId,
}: {
  email: string | undefined;
  organizations: NavOrganization[];
  activeOrganizationId: string | null;
}) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <>
      {pending ? <FullPageLoader label="Switching organization…" /> : null}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
            <Link
              href="/dashboard"
              className="text-lg font-semibold tracking-tight"
            >
              Link Shortener
            </Link>
            <nav className="flex flex-wrap items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/links"
                    ? pathname === "/links" ||
                      (pathname.startsWith("/links/") &&
                        !pathname.startsWith("/links/new"))
                    : pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {organizations.length > 0 ? (
              <div className="relative">
                <select
                  id="active-org"
                  aria-label="Organization"
                  disabled={pending}
                  value={activeOrganizationId ?? undefined}
                  className="flex h-9 max-w-[12rem] rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
                  onChange={(event) => {
                    const orgId = event.target.value;
                    startTransition(() => {
                      void setActiveOrganization(orgId);
                    });
                  }}
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {pending ? (
                  <Spinner
                    className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2"
                    label="Switching organization"
                  />
                ) : null}
              </div>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/organizations/new" />}
            >
              New org
            </Button>
            {email ? (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {email}
              </span>
            ) : null}
            <form action={logout}>
              <PendingSubmitButton
                variant="outline"
                size="sm"
                idleLabel="Logout"
                pendingLabel="Signing out…"
              />
            </form>
          </div>
        </div>
      </header>
    </>
  );
}
