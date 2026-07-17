export type UtmParams = {
  destinationUrl: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
};

function appendUtm(url: URL, key: string, value?: string | null) {
  const trimmed = value?.trim();
  if (trimmed) {
    url.searchParams.set(key, trimmed);
  }
}

/**
 * Builds the final redirect URL, preserving existing query params and hash,
 * and appending only non-empty UTM parameters.
 */
export function buildDestinationUrl({
  destinationUrl,
  utmSource,
  utmMedium,
  utmCampaign,
  utmTerm,
  utmContent,
}: UtmParams): string {
  const url = new URL(destinationUrl);

  appendUtm(url, "utm_source", utmSource);
  appendUtm(url, "utm_medium", utmMedium);
  appendUtm(url, "utm_campaign", utmCampaign);
  appendUtm(url, "utm_term", utmTerm);
  appendUtm(url, "utm_content", utmContent);

  return url.toString();
}
