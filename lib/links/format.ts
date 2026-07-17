export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function truncateUrl(url: string, max = 48): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}
