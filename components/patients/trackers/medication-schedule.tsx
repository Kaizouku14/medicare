"use client";

import { useState } from "react";
import { Pill, Clock, CalendarDays, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Medication } from "@/types/domain";

function countDays(start: string, end?: string | null): number {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

export function MedicationSchedule({
  medications,
}: {
  medications: Medication[];
}) {
  const [expanded, setExpanded] = useState(true);
  const [now] = useState(() => new Date());
  const [cutoff] = useState(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const today = now.toISOString().split("T")[0];
  const active = medications.filter(
    (m) => !m.endDate || m.endDate >= today,
  );
  const past = medications.filter(
    (m) => m.endDate && m.endDate < today,
  );

  if (medications.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6 text-center">
        <Pill className="mx-auto size-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm font-medium text-foreground">No medications</p>
        <p className="text-xs text-muted-foreground">Add medications from the Care page to see them here.</p>
      </div>
    );
  }

  const frequencyGroups = active.reduce<Record<string, Medication[]>>(
    (groups, med) => {
      const key = med.frequency.toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(med);
      return groups;
    },
    {},
  );

  const frequencyOrder = [
    ...new Set(active.map((m) => m.frequency.toLowerCase())),
  ].toSorted();

  return (
    <div className="space-y-6">
      {/* Active medications summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{active.length}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Past</p>
          <p className="mt-1 text-2xl font-bold text-muted-foreground">{past.length}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Unique</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {new Set(active.map((m) => m.name.toLowerCase())).size}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total days</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {active.reduce((sum, m) => sum + countDays(m.startDate, m.endDate), 0)}
          </p>
        </div>
      </div>

      {/* By-frequency schedule */}
      {frequencyOrder.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Schedule by frequency
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              {expanded ? "Collapse" : "Expand"}
            </Button>
          </div>

          <div className="space-y-3">
            {frequencyOrder.map((freq) => {
              const meds = frequencyGroups[freq];
              return (
                <div key={freq} className="rounded-xl border border-border/60 bg-card">
                  <div className="border-b border-border/40 bg-muted/20 px-4 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {freq} &middot; {meds.length} medication{meds.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="divide-y divide-border/30">
                    {meds.map((med) => {
                      const startDate = new Date(med.startDate);
                      const endDate = med.endDate ? new Date(med.endDate) : null;
                      const daysActive = countDays(med.startDate, med.endDate);
                      const isStartingSoon = startDate > now;
                      const isEndingSoon = endDate && endDate < cutoff;

                      return (
                        <div key={med.id} className="px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Pill className="size-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-foreground">{med.name}</p>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full text-[9px] font-medium"
                                  >
                                    {med.dosage}
                                  </Badge>
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {med.route} &middot; {med.frequency}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <CalendarDays className="size-3" />
                                    {new Date(med.startDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                                    {med.endDate ? ` — ${new Date(med.endDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}` : " — Ongoing"}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="rounded-full text-[9px] font-medium"
                                  >
                                    {daysActive} day{daysActive !== 1 ? "s" : ""}
                                  </Badge>
                                  {isStartingSoon && (
                                    <Badge className="rounded-full text-[9px] font-medium bg-blue-100 text-blue-700 hover:bg-blue-100">
                                      Upcoming
                                    </Badge>
                                  )}
                                  {isEndingSoon && (
                                    <Badge className="rounded-full text-[9px] font-medium bg-amber-100 text-amber-700 hover:bg-amber-100">
                                      Ending soon
                                    </Badge>
                                  )}
                                </div>
                                {med.notes && (
                                  <p className="mt-1 text-[10px] italic text-muted-foreground/70">
                                    {med.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past medications */}
      {past.length > 0 && (
        <details className="rounded-xl border border-border/60 bg-card">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-[11px] text-muted-foreground hover:text-foreground">
            <AlertCircle className="size-3.5" />
            Past medications ({past.length})
          </summary>
          <div className="divide-y divide-border/30 border-t border-border/40">
            {past.map((med) => (
              <div key={med.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-xs font-medium text-foreground">{med.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {med.dosage} &middot; Ended{" "}
                    {med.endDate
                      ? new Date(med.endDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full text-[9px] font-medium">
                  {countDays(med.startDate, med.endDate)} days
                </Badge>
              </div>
            ))}
          </div>
        </details>
      )}

      {active.length === 0 && past.length > 0 && (
        <Alert className="rounded-xl border-blue-200 bg-blue-50">
          <AlertCircle className="size-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-800">
            No active medications. All medications have ended.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}