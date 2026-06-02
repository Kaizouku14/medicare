"use client";

import { useState, useMemo } from "react";
import { Activity, TrendingUp, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PatientDocument, DocumentAnalysis } from "@/types/domain";

type LabEntry = {
  date: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
};

type LabSeries = {
  name: string;
  unit: string;
  referenceRange: string;
  entries: LabEntry[];
};

function parseRange(range: string): { low: number; high: number } | null {
  const match = range.match(
    /(\d+(?:\.\d+)?)\s*[-–—to]+\s*(\d+(?:\.\d+)?)/,
  );
  if (match) {
    return { low: Number(match[1]), high: Number(match[2]) };
  }
  const single = range.match(/<(\d+(?:\.\d+)?)/);
  if (single) {
    return { low: 0, high: Number(single[1]) };
  }
  const gt = range.match(/>(\d+(?:\.\d+)?)/);
  if (gt) {
    return { low: Number(gt[1]), high: Infinity };
  }
  return null;
}

function parseValue(v: string): number | null {
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export function LabTrends({
  documents,
}: {
  documents: PatientDocument[];
}) {
  const [selectedLab, setSelectedLab] = useState<string | null>(null);

  const series = useMemo(() => {
    const map = new Map<string, LabSeries>();

    for (const doc of documents) {
      if (!doc.analysis?.extractedValues) continue;
      const date = new Date(doc.createdAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      for (const v of doc.analysis.extractedValues) {
        if (!map.has(v.name)) {
          map.set(v.name, {
            name: v.name,
            unit: v.unit,
            referenceRange: v.referenceRange,
            entries: [],
          });
        }
        map.get(v.name)!.entries.push({
          date,
          value: v.value,
          unit: v.unit,
          referenceRange: v.referenceRange,
          isAbnormal: v.isAbnormal,
        });
      }
    }

    return Array.from(map.values());
  }, [documents]);

  const activeLab = selectedLab
    ? series.find((s) => s.name === selectedLab)
    : null;

  if (series.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/50 px-8 py-12 text-center">
        <Activity className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">
          No lab data available
        </p>
        <p className="text-xs text-muted-foreground/60">
          Upload and analyze medical documents to see lab value trends
        </p>
      </div>
    );
  }

  if (activeLab) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-lg text-xs"
          onClick={() => setSelectedLab(null)}
        >
          <ArrowLeft className="size-3.5" />
          Back to all labs
        </Button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-medium text-foreground">
              {activeLab.name}
            </h2>
            <Badge variant="outline" className="rounded-full text-[10px] font-medium">
              {activeLab.unit}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Reference range: {activeLab.referenceRange}
          </p>
        </div>

        {/* SVG Line Chart */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <LabChart lab={activeLab} />
        </div>

        {/* Values table */}
        <div className="space-y-1">
          {activeLab.entries.map((entry, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
                entry.isAbnormal
                  ? "bg-red-50/50 border border-red-200/60"
                  : "bg-emerald-50/50 border border-emerald-200/60"
              }`}
            >
              <span className="text-xs text-muted-foreground">{entry.date}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {entry.value}
                </span>
                <Badge
                  variant="outline"
                  className={`rounded-full text-[10px] font-medium ${
                    entry.isAbnormal
                      ? "border-red-300 text-red-700"
                      : "border-emerald-300 text-emerald-700"
                  }`}
                >
                  {entry.isAbnormal ? "Abnormal" : "Normal"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="size-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Lab Trends
        </p>
      </div>

      {series.map((lab) => {
        const latest = lab.entries[lab.entries.length - 1];
        const range = parseRange(lab.referenceRange);
        const numVal = parseValue(latest.value);
        const hasTrend = lab.entries.length >= 2;

        return (
          <button
            key={lab.name}
            type="button"
            onClick={() => setSelectedLab(lab.name)}
            className="w-full animate-fade-in-up rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/20 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {lab.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Latest: {latest.value} {lab.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasTrend && (
                  <TrendingUp className="size-3.5 text-muted-foreground" />
                )}
                {latest.isAbnormal ? (
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] font-medium border-red-300 text-red-700 bg-red-50"
                  >
                    Abnormal
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] font-medium border-emerald-300 text-emerald-700 bg-emerald-50"
                  >
                    Normal
                  </Badge>
                )}
              </div>
            </div>
            {numVal && range && (
              <div className="mt-2.5">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`absolute inset-y-0 rounded-full ${
                      latest.isAbnormal ? "bg-red-400" : "bg-emerald-400"
                    }`}
                    style={{
                      left: `${Math.max(0, Math.min(100, ((numVal - range.low) / (range.high - range.low)) * 100))}%`,
                      width: "6px",
                      marginLeft: "-3px",
                    }}
                  />
                  <div
                    className="absolute inset-y-0 rounded-full bg-primary/20"
                    style={{
                      left: `${(range.low / range.high) * 100}%`,
                      width: `${((range.high - range.low) / range.high) * 100}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>{range.low}</span>
                  <span>Range: {lab.referenceRange}</span>
                  <span>{range.high === Infinity ? "∞" : range.high}</span>
                </div>
              </div>
            )}
            <div className="mt-2 flex gap-1">
              {lab.entries.map((e, i) => (
                <span
                  key={i}
                  className={`inline-block h-1.5 flex-1 rounded-full ${
                    e.isAbnormal ? "bg-red-300" : "bg-emerald-300"
                  }`}
                  title={`${e.date}: ${e.value} ${e.unit}`}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LabChart({ lab }: { lab: LabSeries }) {
  const range = parseRange(lab.referenceRange);
  const values = lab.entries
    .map((e) => parseValue(e.value))
    .filter((v): v is number => v !== null);

  if (values.length < 2 || !range) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Need at least 2 data points to show a trend chart
      </p>
    );
  }

  const min = Math.min(...values, range.low) * 0.9;
  const max = Math.max(...values, range.high) * 1.1;
  const chartW = 600;
  const chartH = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 50 };
  const w = chartW - pad.left - pad.right;
  const h = chartH - pad.top - pad.bottom;

  function x(i: number) {
    return pad.left + (i / (values.length - 1)) * w;
  }

  function y(v: number) {
    return pad.top + h - ((v - min) / (max - min)) * h;
  }

  const rangeLowY = y(range.low);
  const rangeHighY = y(range.high);
  const linePath = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-h-56">
      {/* Reference range band */}
      <rect
        x={pad.left}
        y={rangeHighY}
        width={w}
        height={rangeLowY - rangeHighY}
        fill="oklch(0.9 0.05 145 / 0.2)"
        rx={4}
      />

      {/* Y-axis labels */}
      {[min, (min + max) / 2, max].map((v, i) => (
        <text
          key={i}
          x={pad.left - 8}
          y={y(v) + 4}
          textAnchor="end"
          className="fill-muted-foreground text-[10px]"
        >
          {v.toFixed(1)}
        </text>
      ))}

      {/* X-axis labels */}
      {lab.entries.map((e, i) => (
        <text
          key={i}
          x={x(i)}
          y={chartH - 5}
          textAnchor={i === 0 ? "start" : i === values.length - 1 ? "end" : "middle"}
          className="fill-muted-foreground text-[9px]"
        >
          {e.date}
        </text>
      ))}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="oklch(0.55 0.15 255)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {values.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={4}
          className={lab.entries[i].isAbnormal ? "fill-red-500" : "fill-emerald-500"}
          stroke="white"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
