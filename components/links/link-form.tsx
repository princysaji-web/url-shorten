"use client";

import { useActionState } from "react";

import type { LinkActionState } from "@/app/actions/links";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Link } from "@/lib/supabase/database.types";

const initialState: LinkActionState = { error: null };

type LinkFormProps = {
  action: (
    prevState: LinkActionState,
    formData: FormData,
  ) => Promise<LinkActionState>;
  link?: Link;
  submitLabel: string;
};

export function LinkForm({ action, link, submitLabel }: LinkFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="destinationUrl">Destination URL</Label>
        <Input
          id="destinationUrl"
          name="destinationUrl"
          type="url"
          required
          defaultValue={link?.destination_url ?? ""}
          placeholder="https://example.com/landing-page"
        />
        <p className="text-sm text-muted-foreground">
          Must be a valid http or https URL.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">UTM parameters (optional)</h3>
          <p className="text-sm text-muted-foreground">
            Appended to the destination when someone opens the short link.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="utmSource">utm_source</Label>
            <Input
              id="utmSource"
              name="utmSource"
              defaultValue={link?.utm_source ?? ""}
              placeholder="qr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utmMedium">utm_medium</Label>
            <Input
              id="utmMedium"
              name="utmMedium"
              defaultValue={link?.utm_medium ?? ""}
              placeholder="offline"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utmCampaign">utm_campaign</Label>
            <Input
              id="utmCampaign"
              name="utmCampaign"
              defaultValue={link?.utm_campaign ?? ""}
              placeholder="summer_campaign"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utmTerm">utm_term</Label>
            <Input
              id="utmTerm"
              name="utmTerm"
              defaultValue={link?.utm_term ?? ""}
              placeholder=""
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="utmContent">utm_content</Label>
            <Input
              id="utmContent"
              name="utmContent"
              defaultValue={link?.utm_content ?? ""}
              placeholder="booth_a"
            />
          </div>
        </div>
      </div>

      {link ? (
        <div className="space-y-2">
          <Label htmlFor="isActive">Status</Label>
          <select
            id="isActive"
            name="isActive"
            defaultValue={link.is_active ? "true" : "false"}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      ) : null}

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <PendingSubmitButton idleLabel={submitLabel} pendingLabel="Saving…" />
    </form>
  );
}
