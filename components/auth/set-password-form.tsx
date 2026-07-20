"use client";

import { useActionState } from "react";

import { setPassword, type SetPasswordState } from "@/app/actions/auth";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SetPasswordState = { error: null };

export function SetPasswordForm() {
  const [state, formAction] = useActionState(setPassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <PendingSubmitButton
        className="w-full"
        idleLabel="Set password"
        pendingLabel="Saving…"
      />
    </form>
  );
}
