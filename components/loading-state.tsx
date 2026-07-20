import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner className="size-8 text-foreground" label={label} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
