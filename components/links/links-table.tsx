"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteLink } from "@/app/actions/links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildDestinationUrl } from "@/lib/links/build-destination-url";
import { formatDate, truncateUrl } from "@/lib/links/format";
import { buildShortUrl } from "@/lib/links/short-url";
import type { Link as LinkRow } from "@/lib/supabase/database.types";

export type LinkWithClicks = LinkRow & { click_count: number };

function LinkRowActions({ link }: { link: LinkWithClicks }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open row actions"
            disabled={pending}
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem
          render={<Link href={`/links/${link.id}`} />}
        >
          <Eye />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href={`/links/${link.id}/edit`} />}
        >
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={() => {
            if (
              !window.confirm(
                `Delete /${link.short_code}? This cannot be undone.`,
              )
            ) {
              return;
            }
            startTransition(async () => {
              const result = await deleteLink(link.id);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Link deleted");
              router.refresh();
            });
          }}
        >
          {pending ? <Spinner label="Deleting" /> : <Trash2 />}
          {pending ? "Deleting…" : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const columns: ColumnDef<LinkWithClicks>[] = [
  {
    id: "short_path",
    header: "Short URL",
    cell: ({ row }) => {
      const shortUrl = buildShortUrl(row.original.short_code);
      const path = `/${row.original.short_code}`;
      return (
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {path}
        </a>
      );
    },
  },
  {
    id: "destination",
    header: "Destination",
    cell: ({ row }) => {
      const link = row.original;
      const destination = buildDestinationUrl({
        destinationUrl: link.destination_url,
        utmSource: link.utm_source,
        utmMedium: link.utm_medium,
        utmCampaign: link.utm_campaign,
        utmTerm: link.utm_term,
        utmContent: link.utm_content,
      });
      return (
        <span className="block max-w-md truncate" title={destination}>
          {truncateUrl(destination, 64)}
        </span>
      );
    },
  },
  {
    accessorKey: "click_count",
    header: "Clicks",
    cell: ({ row }) => row.original.click_count,
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <LinkRowActions link={row.original} />
      </div>
    ),
  },
];

export function LinksTable({
  links,
  emptyMessage = "No links yet.",
}: {
  links: LinkWithClicks[];
  emptyMessage?: string;
}) {
  const table = useReactTable({
    data: links,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.id === "actions" ? "w-12 text-right" : undefined}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
