export function getShortLinkDomain(): string {
  const domain =
    process.env.NEXT_PUBLIC_SHORT_LINK_DOMAIN?.replace(/\/$/, "") ??
    "https://www.cs.net";
  return domain;
}

export function buildShortUrl(shortCode: string): string {
  return `${getShortLinkDomain()}/${shortCode}`;
}
