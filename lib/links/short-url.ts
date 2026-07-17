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
