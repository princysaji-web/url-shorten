import Link from "next/link";

import { CopyButton } from "@/components/links/copy-button";
import { ToggleActiveButton } from "@/components/links/toggle-active-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, truncateUrl } from "@/lib/links/format";
import { buildShortUrl } from "@/lib/links/short-url";
import type { Link as LinkRow } from "@/lib/supabase/database.types";

export type LinkWithClicks = LinkRow & { click_count: number };

export function LinksTable({
  links,
  emptyMessage = "No links yet.",
}: {
  links: LinkWithClicks[];
  emptyMessage?: string;
}) {
  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short URL</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>UTM Source</TableHead>
            <TableHead>UTM Medium</TableHead>
            <TableHead>UTM Campaign</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => {
            const shortUrl = buildShortUrl(link.short_code);
            return (
              <TableRow key={link.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <span className="whitespace-nowrap">{shortUrl}</span>
                    <CopyButton value={shortUrl} label="Copy" />
                  </div>
                </TableCell>
                <TableCell title={link.destination_url}>
                  {truncateUrl(link.destination_url)}
                </TableCell>
                <TableCell>{link.utm_source ?? "—"}</TableCell>
                <TableCell>{link.utm_medium ?? "—"}</TableCell>
                <TableCell>{link.utm_campaign ?? "—"}</TableCell>
                <TableCell>{link.click_count}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(link.created_at)}
                </TableCell>
                <TableCell>
                  <Badge variant={link.is_active ? "default" : "secondary"}>
                    {link.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link href={`/links/${link.id}`} />}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link href={`/links/${link.id}/edit`} />}
                    >
                      Edit
                    </Button>
                    <ToggleActiveButton
                      linkId={link.id}
                      isActive={link.is_active}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
