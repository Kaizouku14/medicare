"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Activity, ChevronDown, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DocumentAnalysis } from "@/types/domain";

export function AnalysisDisplay({
  analysis,
}: {
  analysis: DocumentAnalysis;
}) {
  const [showFindings, setShowFindings] = useState(false);
  const abnormalValues = analysis.extractedValues.filter((v) => v.isAbnormal);

  return (
    <div className="space-y-5">
      {/* Abnormal value alert */}
      {abnormalValues.length > 0 ? (
        <Alert
          variant="destructive"
          className="rounded-xl border-red-200 bg-red-50/80 doc-alert-abnormal"
        >
          <AlertCircle className="size-4" />
          <AlertDescription className="text-sm font-medium">
            {abnormalValues.length === 1
              ? "1 abnormal value detected"
              : `${abnormalValues.length} abnormal values detected`}
          </AlertDescription>
        </Alert>
      ) : analysis.extractedValues.length > 0 ? (
        <Alert className="rounded-xl border-emerald-200 bg-emerald-50/80 doc-alert-normal">
          <CheckCircle2 className="size-4 text-emerald-600 doc-icon-positive" />
          <AlertDescription className="text-sm font-medium text-emerald-800 doc-text-positive">
            All values within normal range
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Summary card */}
      <div className="rounded-xl border border-border/60 bg-card doc-card p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-medium text-foreground">
              Analysis Summary
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {analysis.documentType === "lab-results"
                ? "Laboratory Results"
                : analysis.documentType === "ct-scan"
                  ? "CT Scan Report"
                  : analysis.documentType === "ecg"
                    ? "ECG Report"
                    : "Medical Document"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground/85 doc-text-soft">
          {analysis.summary}
        </p>
      </div>

      {/* Findings (expandable) */}
      {analysis.findings && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card doc-card">
          <button
            onClick={() => setShowFindings(!showFindings)}
            className="flex w-full items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-muted/30 doc-card-hover"
          >
            {showFindings ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Detailed Findings
            </span>
          </button>
          {showFindings && (
            <div className="border-t border-border/60 px-5 py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85 doc-text-soft">
                {analysis.findings}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Extracted values */}
      {analysis.extractedValues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Extracted Values
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {analysis.extractedValues.map((v, i) => (
              <div
                key={i}
                className={`animate-fade-in-up rounded-xl border p-3.5 ${
                  v.isAbnormal
                    ? "border-red-200/80 bg-red-50/50 doc-alert-abnormal"
                    : "border-emerald-200/80 bg-emerald-50/50 doc-alert-normal"
                }`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground">
                    {v.name}
                  </p>
                  <Badge
                    variant="outline"
                    className={`rounded-full text-[10px] font-medium ${
                      v.isAbnormal
                        ? "border-red-300 text-red-700 doc-badge-abnormal"
                        : "border-emerald-300 text-emerald-700 doc-badge-normal"
                    }`}
                  >
                    {v.isAbnormal ? "Abnormal" : "Normal"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {v.value}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {v.unit}
                  </span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Range: {v.referenceRange}
                </p>
                <p className="mt-1 text-[11px] italic leading-relaxed text-muted-foreground/70">
                  {v.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concerns */}
      {analysis.concerns.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Clinical Concerns
            </p>
            <ul className="space-y-1.5">
              {analysis.concerns.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 rounded-lg bg-amber-50/60 px-3.5 py-2.5 text-sm text-foreground/85 doc-concern"
                >
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-500 doc-concern-icon" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Dietary considerations */}
      <>
        <Separator />
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Dietary Considerations
          </p>
          <p className="text-sm leading-relaxed text-foreground/85 doc-text-soft">
            {analysis.dietaryConsiderations}
          </p>
        </div>
      </>
    </div>
  );
}
