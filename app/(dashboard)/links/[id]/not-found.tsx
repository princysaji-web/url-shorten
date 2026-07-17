import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LinkNotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Link not found</h1>
      <p className="text-muted-foreground">
        This link does not exist or you do not have access to it.
      </p>
      <Button render={<Link href="/links" />}>Back to links</Button>
    </div>
  );
}
