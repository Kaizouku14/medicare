"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Users, Plus, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Patient } from "@/types/domain";

const PAGE_SIZE = 9;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PatientList({ patients }: { patients: Patient[] }) {
  const [search, setSearch] = useState("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);

  const allDiagnoses = useMemo(() => {
    const set = new Set<string>();
    patients.forEach((p) => p.diagnoses.forEach((d) => set.add(d)));
    return Array.from(set).sort();
  }, [patients]);

  const filtered = useMemo(() => {
    let result = patients;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.diagnoses.some((d) => d.toLowerCase().includes(q)),
      );
    }

    if (selectedDiagnosis) {
      result = result.filter((p) => p.diagnoses.includes(selectedDiagnosis));
    }

    return result;
  }, [patients, search, selectedDiagnosis]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border/50 bg-gradient-to-br from-card via-card to-muted/20 px-8 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
          <Users className="size-6 text-primary" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            No patients yet
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Add your first patient profile to start generating AI-powered meal
            plans
          </p>
        </div>
        <Button
          asChild
          variant="default"
          size="lg"
          className="mt-2 h-10 rounded-xl px-5 shadow-xs"
        >
          <Link href="/dashboard/patients/new">
            <Plus className="mr-2 size-4" />
            Add your first patient
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or diagnosis..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-xl border-border/60 pl-9 text-sm"
          />
          {search && (
            <button type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allDiagnoses.map((d) => (
            <button type="button"
              key={d}
              onClick={() => {
                setSelectedDiagnosis(selectedDiagnosis === d ? null : d);
                setPage(1);
              }}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                selectedDiagnosis === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
              }`}
            >
              {d.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length === patients.length
            ? `${patients.length} patient${patients.length !== 1 ? "s" : ""}`
            : `${filtered.length} of ${patients.length} patient${patients.length !== 1 ? "s" : ""}`}
        </p>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 gap-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Link href="/dashboard/patients/new">
            <Plus className="size-3.5" />
            New
          </Link>
        </Button>
      </div>

      {/* List */}
      <div className="grid gap-3 sm:grid-cols-2">
        {paginated.map((patient, i) => (
          <Link
            key={patient.id}
            href={`/dashboard/patients/${patient.id}`}
            className="group animate-fade-in-up relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/20 hover:shadow-sm"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="absolute -right-8 -top-8 size-20 rounded-full bg-primary/5 blur-xl transition-all group-hover:scale-150" />
            <div className="relative">
              <div className="flex items-start gap-3.5">
                <Avatar className="size-11 rounded-xl ring-1 ring-border/40 shadow-xs">
                  <AvatarFallback className="rounded-xl text-xs font-bold bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {patient.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="shrink-0 rounded-full text-[11px] font-semibold"
                    >
                      ₱{patient.monthlyBudgetPhp.toLocaleString()}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {patient.age} years &middot;{" "}
                    {patient.feedingMethod.replace("-", " + ")}
                    {patient.weightKg && ` · ${patient.weightKg} kg`}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1">
                    {patient.diagnoses.slice(0, 2).map((d) => (
                      <Badge
                        key={d}
                        variant="secondary"
                        className="rounded-full text-[10px] font-medium"
                      >
                        {d.replace(/-/g, " ")}
                      </Badge>
                    ))}
                    {patient.diagnoses.length > 2 && (
                      <Badge
                        variant="outline"
                        className="rounded-full text-[10px] font-medium"
                      >
                        +{patient.diagnoses.length - 2}
                      </Badge>
                    )}
                    <ArrowRight className="ml-auto size-3.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="size-8 rounded-lg p-0"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
              className="h-8 min-w-8 rounded-lg px-2 text-xs font-medium"
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="size-8 rounded-lg p-0"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
