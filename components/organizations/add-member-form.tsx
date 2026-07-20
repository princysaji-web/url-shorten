"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  addOrganizationMember,
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
      {pending ? "Adding…" : "Add member"}
    </Button>
  );
}

export function AddMemberForm({
  organizationId,
}: {
  organizationId: string;
}) {
  const action = addOrganizationMember.bind(null, organizationId);
  const [state, formAction] = useActionState(action, initialState);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [state.setupLink]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="teammate@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            defaultValue="member"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        No email is sent. Copy the password setup link and share it yourself.
      </p>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.success ? (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : null}
      {state.setupLink ? (
        <div className="space-y-2 rounded-md border bg-background p-3">
          <Label htmlFor="setup-link">Password setup link (share manually)</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="setup-link"
              readOnly
              value={state.setupLink}
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(state.setupLink!);
                setCopied(true);
                toast.success("Setup link copied");
              }}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            They open this link, set their password, then sign in. Nothing is
            emailed by the app or Supabase.
          </p>
        </div>
      ) : null}
      <SubmitButton />
    </form>
  );
}
