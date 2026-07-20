const DEFAULT_SHORT_LINK_DOMAIN = "https://www.cs.net";

/**
 * Base URL for public short links (origin only — no /dashboard or other paths).
 */
export function getShortLinkDomain(): string {
  const raw = process.env.NEXT_PUBLIC_SHORT_LINK_DOMAIN?.trim();
  if (!raw) {
    return DEFAULT_SHORT_LINK_DOMAIN;
  }

  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

export function buildShortUrl(shortCode: string): string {
  return `${getShortLinkDomain()}/${shortCode}`;
}

/** Where invite/setup links should land after Supabase verify. */
export function getAuthCallbackUrl(nextPath = "/auth/set-password"): string {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${getShortLinkDomain()}/auth/callback?next=${encodeURIComponent(next)}`;
}

/**
 * Supabase generateLink embeds Site URL (often localhost) into redirect_to.
 * Rewrite it to our public app origin before sharing the link.
 */
export function withAppAuthRedirect(actionLink: string): string {
  const url = new URL(actionLink);
  url.searchParams.set("redirect_to", getAuthCallbackUrl());
  return url.toString();
}
