"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createOrganization,
  type OrgActionState,
} from "@/app/actions/organizations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: OrgActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create organization"}
    </Button>
  );
}

export function CreateOrganizationForm() {
  const [state, formAction] = useActionState(createOrganization, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          minLength={2}
          placeholder="CareStack"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input id="slug" name="slug" placeholder="carestack" />
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers, and hyphens. Defaults from the name.
        </p>
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <SubmitButton />
    </form>
  );
}
