"use client";

import { Sparkles, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GenerateCard({
  hasPlan,
  generating,
  generationMessage,
  patientName,
  hasLatestDoc,
  onGenerate,
}: {
  hasPlan: boolean;
  generating: boolean;
  generationMessage: string;
  patientName: string;
  hasLatestDoc: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/70 bg-linear-to-br from-card via-card to-secondary/10 p-8">
      <div className="absolute -right-12 -top-12 size-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-secondary/20 blur-2xl" />

      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20">
          <Sparkles className="size-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {hasPlan ? "Meal plan generated" : "Ready to generate"}
          </p>
          <p className="text-xs text-muted-foreground">
            {hasPlan
              ? "Regenerate to get updated recommendations based on the latest profile"
              : `AI will analyze ${patientName}'s clinical profile${hasLatestDoc ? " and latest lab results" : ""} to create a personalized weekly plan`}
          </p>
        </div>
        <Button
          onClick={onGenerate}
          disabled={generating}
          size="lg"
          className="h-10 w-full shrink-0 rounded-xl px-6 text-sm font-semibold shadow-xs sm:w-auto"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Generating…
            </>
          ) : hasPlan ? (
            <>
              <RotateCcw className="mr-2 size-4" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              Generate Plan
            </>
          )}
        </Button>
      </div>

      {generating && (
        <div className="relative mt-5 flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-1/2 animate-shimmer rounded-full bg-linear-to-r from-transparent via-primary/40 to-transparent" />
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground animate-pulse">
            {generationMessage || "Starting..."}
          </span>
        </div>
      )}
    </div>
  );
}
