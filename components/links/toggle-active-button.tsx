"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { setLinkActive } from "@/app/actions/links";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export function ToggleActiveButton({
  linkId,
  isActive,
}: {
  linkId: string;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await setLinkActive(linkId, !isActive);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isActive ? "Link disabled" : "Link enabled");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={isActive ? "destructive" : "default"} size="sm" />
        }
      >
        {isActive ? "Disable" : "Enable"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isActive ? "Disable this link?" : "Enable this link?"}
          </DialogTitle>
          <DialogDescription>
            {isActive
              ? "Disabled links will no longer redirect. Existing short URLs and QR codes stop working until re-enabled."
              : "Enabling restores redirects for this short URL and QR code."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={confirm}
            disabled={pending}
          >
            {pending ? <Spinner label="Updating" /> : null}
            {pending ? "Updating…" : isActive ? "Disable link" : "Enable link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
