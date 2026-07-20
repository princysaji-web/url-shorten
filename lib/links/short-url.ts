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

/**
 * App-owned member setup URL. Verifies the token on our /auth/callback
 * so Supabase Site URL (localhost) never controls the redirect.
 * Uses recovery type — never invite emails.
 */
export function buildMemberSetupLink(
  tokenHash: string,
  type: "recovery" | "invite" = "recovery",
): string {
  const url = new URL("/auth/callback", getShortLinkDomain());
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", type);
  url.searchParams.set("next", "/auth/set-password");
  return url.toString();
}
