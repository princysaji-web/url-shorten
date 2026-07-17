import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/links/copy-button";
import { ToggleActiveButton } from "@/components/links/toggle-active-button";
import { QrCodeCard } from "@/components/qr-code/qr-code-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/links/format";
import { buildShortUrl } from "@/lib/links/short-url";
import { createClient } from "@/lib/supabase/server";

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("links")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!link) {
    notFound();
  }

  const { count } = await supabase
    .from("link_clicks")
    .select("*", { count: "exact", head: true })
    .eq("link_id", link.id);

  const shortUrl = buildShortUrl(link.short_code);

  const utmRows = [
    { label: "utm_source", value: link.utm_source },
    { label: "utm_medium", value: link.utm_medium },
    { label: "utm_campaign", value: link.utm_campaign },
    { label: "utm_term", value: link.utm_term },
    { label: "utm_content", value: link.utm_content },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Link details
            </h1>
            <Badge variant={link.is_active ? "default" : "secondary"}>
              {link.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Created {formatDate(link.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={<Link href={`/links/${link.id}/edit`} />}
          >
            Edit Link
          </Button>
          <ToggleActiveButton linkId={link.id} isActive={link.is_active} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Link information</CardTitle>
            <CardDescription>
              Short URL resolves publicly; management stays authenticated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Short URL</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="break-all font-medium">{shortUrl}</p>
                <CopyButton value={shortUrl} label="Copy Short URL" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Short code</p>
              <p className="font-mono text-sm">{link.short_code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Original destination URL
              </p>
              <p className="break-all">{link.destination_url}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total clicks</p>
              <p className="text-2xl font-semibold">{count ?? 0}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">UTM parameters</p>
              <dl className="grid gap-2 sm:grid-cols-2">
                {utmRows.map((row) => (
                  <div key={row.label} className="rounded-md border px-3 py-2">
                    <dt className="text-xs text-muted-foreground">{row.label}</dt>
                    <dd className="text-sm">{row.value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </CardContent>
        </Card>

        <QrCodeCard shortUrl={shortUrl} shortCode={link.short_code} />
      </div>
    </div>
  );
}
