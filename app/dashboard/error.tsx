"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50/50 px-8 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-red-100">
        <AlertCircle className="size-5 text-red-500" />
      </div>
      <div>
        <h2 className="font-serif text-xl font-medium text-foreground">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-9 rounded-xl px-4 text-xs"
        onClick={reset}
      >
        <RotateCcw className="mr-1.5 size-3.5" />
        Try again
      </Button>
    </div>
  );
}
