"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function FullPageLoader({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[1px]",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner className="size-8 text-foreground" label={label} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
