import type { createClient } from "@/lib/supabase/server";
import type { Link } from "@/lib/supabase/database.types";
import type { LinkWithClicks } from "@/components/links/links-table";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getClickCountsByLinkIds(
  supabase: SupabaseServerClient,
  linkIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (linkIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("link_clicks")
    .select("link_id")
    .in("link_id", linkIds);

  if (error || !data) {
    return counts;
  }

  for (const row of data) {
    counts.set(row.link_id, (counts.get(row.link_id) ?? 0) + 1);
  }

  return counts;
}

export function withClickCounts(
  links: Link[],
  counts: Map<string, number>,
): LinkWithClicks[] {
  return links.map((link) => ({
    ...link,
    click_count: counts.get(link.id) ?? 0,
  }));
}

export async function getDashboardStats(
  supabase: SupabaseServerClient,
  organizationId: string,
) {
  const { data: links, error } = await supabase
    .from("links")
    .select("id, is_active")
    .eq("organization_id", organizationId);

  if (error || !links) {
    return {
      totalLinks: 0,
      activeLinks: 0,
      totalClicks: 0,
      qrCodesGenerated: 0,
    };
  }

  const linkIds = links.map((link) => link.id);

  if (linkIds.length === 0) {
    return {
      totalLinks: 0,
      activeLinks: 0,
      totalClicks: 0,
      qrCodesGenerated: 0,
    };
  }

  const { count: totalClicks } = await supabase
    .from("link_clicks")
    .select("*", { count: "exact", head: true })
    .in("link_id", linkIds);

  return {
    totalLinks: links.length,
    activeLinks: links.filter((link) => link.is_active).length,
    totalClicks: totalClicks ?? 0,
    qrCodesGenerated: links.length,
  };
}
