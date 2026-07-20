import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Spinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Loader2Icon
      role="status"
      aria-label={label}
      className={cn("size-4 animate-spin", className)}
    />
  );
}
