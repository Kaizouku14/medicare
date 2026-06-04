"use client";

import { useState } from "react";
import { Pill, Clock, CalendarDays, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Medication } from "@/types/domain";

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

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

  type MedEntry = { med: Medication; time: string };

  const timeEntries = active.flatMap<MedEntry>((med) => {
    if (med.times.length === 0) return [{ med, time: "Any time" }];
    return med.times.map((t) => ({ med, time: t }));
  });

  const timeGroups = timeEntries.reduce<Record<string, MedEntry[]>>(
    (groups, entry) => {
      if (!groups[entry.time]) groups[entry.time] = [];
      groups[entry.time].push(entry);
      return groups;
    },
    {},
  );

  const timeOrder = Object.keys(timeGroups).sort((a, b) => {
    if (a === "Any time") return 1;
    if (b === "Any time") return -1;
    return a.localeCompare(b);
  });

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

      {/* Timeline schedule */}
      {timeOrder.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Daily timeline
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

          <div className="relative">
            {expanded &&
              timeOrder.map((time) => {
                const entries = timeGroups[time];
                const isMorning = time < "12:00" && time !== "Any time";
                const isAfternoon = time >= "12:00" && time < "18:00" && time !== "Any time";
                const isEvening = time >= "18:00" && time !== "Any time";
                const periodLabel = time !== "Any time" ? formatTime(time) : null;

                return (
                  <div key={time} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line and dot */}
                    <div className="flex flex-col items-center">
                      <div className={`z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        isMorning ? "border-amber-300 bg-amber-50 text-amber-700" :
                        isAfternoon ? "border-orange-300 bg-orange-50 text-orange-700" :
                        isEvening ? "border-indigo-300 bg-indigo-50 text-indigo-700" :
                        "border-muted-300 bg-muted text-muted-foreground"
                      }`}>
                        {time === "Any time" ? "?" : periodLabel?.split(" ")[0] ?? ""}
                      </div>
                      <div className="mt-1 w-px flex-1 bg-border/50" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">
                          {periodLabel ?? "Any time"}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          &middot; {entries.length} med{entries.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {entries.map(({ med, time: entryTime }) => {
                        const startDate = new Date(med.startDate);
                        const endDate = med.endDate ? new Date(med.endDate) : null;
                        const daysActive = countDays(med.startDate, med.endDate);
                        const isStartingSoon = startDate > now;
                        const isEndingSoon = endDate && endDate < cutoff;

                        return (
                          <div key={`${med.id}-${entryTime}`} className="rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Pill className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-foreground">{med.name}</p>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full text-[9px] font-medium shrink-0"
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