import Link from "next/link";

import { LinksTable } from "@/components/links/links-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getClickCountsByLinkIds,
  getDashboardStats,
  withClickCounts,
} from "@/lib/links/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const stats = await getDashboardStats(supabase);

  const { data: recentLinks } = await supabase
    .from("links")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const links = recentLinks ?? [];
  const counts = await getClickCountsByLinkIds(
    supabase,
    links.map((link) => link.id),
  );
  const linksWithClicks = withClickCounts(links, counts);

  const statCards = [
    { label: "Total Links", value: stats.totalLinks },
    { label: "Total Clicks", value: stats.totalClicks },
    { label: "Active Links", value: stats.activeLinks },
    { label: "QR Codes Generated", value: stats.qrCodesGenerated },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your short links and click activity.
          </p>
        </div>
        <Button render={<Link href="/links/new" />}>Create New Link</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent links</CardTitle>
          <CardDescription>Your 10 most recently created short links.</CardDescription>
        </CardHeader>
        <CardContent>
          <LinksTable
            links={linksWithClicks}
            emptyMessage="No links yet. Create your first short link to get started."
          />
        </CardContent>
      </Card>
    </div>
  );
}
