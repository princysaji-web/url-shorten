import Link from "next/link";
import { redirect } from "next/navigation";

import { LinksTable } from "@/components/links/links-table";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getClickCountsByLinkIds,
  withClickCounts,
} from "@/lib/links/queries";
import { getActiveOrganizationContext } from "@/lib/organizations/context";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "all";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

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

  let query = supabase
    .from("links")
    .select("*", { count: "exact" })
    .eq("organization_id", active.organization.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (q) {
    const escaped = q.replace(/[%_,]/g, "");
    if (escaped) {
      query = query.or(
        `short_code.ilike.%${escaped}%,destination_url.ilike.%${escaped}%`,
      );
    }
  }

  const { data, count, error } = await query;
  const links = data ?? [];
  const counts = await getClickCountsByLinkIds(
    supabase,
    links.map((link) => link.id),
  );
  const linksWithClicks = withClickCounts(links, counts);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Links</h1>
          <p className="text-muted-foreground">
            Search, filter, and manage your short links.
          </p>
        </div>
        <Button render={<Link href="/links/new" />}>Create New Link</Button>
      </div>

      <form className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Short code or destination URL"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-40"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <PendingSubmitButton
          variant="secondary"
          idleLabel="Apply"
          pendingLabel="Filtering…"
        />
      </form>

      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <LinksTable
          links={linksWithClicks}
          emptyMessage="No links match your filters."
        />
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page <= 1 ? (
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link
                    href={`/links?q=${encodeURIComponent(q)}&status=${status}&page=${page - 1}`}
                  />
                }
              >
                Previous
              </Button>
            )}
            {page >= totalPages ? (
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link
                    href={`/links?q=${encodeURIComponent(q)}&status=${status}&page=${page + 1}`}
                  />
                }
              >
                Next
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
