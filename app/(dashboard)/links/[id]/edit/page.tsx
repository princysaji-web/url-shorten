import { notFound } from "next/navigation";

import { updateLink } from "@/app/actions/links";
import { LinkForm } from "@/components/links/link-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function EditLinkPage({
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

  const action = updateLink.bind(null, link.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Link</h1>
        <p className="text-muted-foreground">
          Update destination, UTM parameters, or status. Short code stays the
          same.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {link.short_code}</CardTitle>
          <CardDescription>
            Changes apply immediately to future redirects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkForm
            action={action}
            link={link}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
