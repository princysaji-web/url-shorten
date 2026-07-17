"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link2, LayoutDashboard, Plus } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/links/new", label: "Create Link", icon: Plus },
];

export function DashboardNav({ email }: { email: string | undefined }) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
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

        <div className="flex items-center gap-3">
          {email ? (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {email}
            </span>
          ) : null}
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
