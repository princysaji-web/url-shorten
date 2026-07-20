import { unstable_cache, updateTag } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

export type CachedLink = {
  id: string;
  destination_url: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  is_active: boolean;
};

/** Safety-net TTL; mutations also invalidate via updateTag. */
export const LINK_CACHE_REVALIDATE_SECONDS = 60 * 60;

export function linkCacheTag(shortCode: string): string {
  return `link-${shortCode}`;
}

/**
 * Looks up a short link with Next.js Data Cache.
 * Cache hits skip Supabase SELECT; click inserts stay outside this helper.
 */
export async function getCachedLinkByShortCode(
  shortCode: string,
): Promise<CachedLink | null> {
  return unstable_cache(
    async () => {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("links")
        .select(
          "id, destination_url, utm_source, utm_medium, utm_campaign, utm_term, utm_content, is_active",
        )
        .eq("short_code", shortCode)
        .maybeSingle();

      if (error) {
        console.error("Short link lookup failed:", error.message);
        throw new Error(error.message);
      }

      return data;
    },
    [`link-${shortCode}`],
    {
      tags: [linkCacheTag(shortCode)],
      revalidate: LINK_CACHE_REVALIDATE_SECONDS,
    },
  )();
}

/** Immediate invalidation after link edit/disable (Server Actions). */
export function invalidateCachedLink(shortCode: string): void {
  updateTag(linkCacheTag(shortCode));
}
