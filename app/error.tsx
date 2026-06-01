"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50">
        <AlertCircle className="size-6 text-red-500" />
      </div>
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl px-4 text-xs"
          onClick={reset}
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          Try again
        </Button>
        <Button
          size="sm"
          className="h-9 rounded-xl px-4 text-xs"
          asChild
        >
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
