"use client";

import { useFormStatus } from "react-dom";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

type PendingSubmitButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "type" | "disabled"
> & {
  idleLabel: string;
  pendingLabel?: string;
};

export function PendingSubmitButton({
  idleLabel,
  pendingLabel = "Saving…",
  className,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={className} {...props}>
      {pending ? <Spinner label={pendingLabel} /> : null}
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
