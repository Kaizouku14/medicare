import Link from "next/link";
import { Frown } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Frown className="size-6 text-muted-foreground" />
      </div>
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Button
        size="sm"
        className="h-9 rounded-xl px-4 text-xs"
        asChild
      >
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}
