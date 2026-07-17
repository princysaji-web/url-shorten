import { createLink } from "@/app/actions/links";
import { LinkForm } from "@/components/links/link-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewLinkPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Link</h1>
        <p className="text-muted-foreground">
          Generate a short URL, optional UTM parameters, and a QR code.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New short link</CardTitle>
          <CardDescription>
            Destination URL is required. UTM fields are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkForm action={createLink} submitLabel="Generate Short URL" />
        </CardContent>
      </Card>
    </div>
  );
}
