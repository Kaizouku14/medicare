import Link from "next/link";
import { Plus, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PatientList } from "@/components/patients/patient-list";
import { listPatientsByUser } from "@/lib/db/patients";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const patients = await listPatientsByUser(user.id);

  const totalMonthlyBudget = patients.reduce(
    (sum, p) => sum + p.monthlyBudgetPhp,
    0,
  );

  return (
    <div className="animate-fade-in space-y-6 pb-16 sm:space-y-8 sm:pb-0">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/[0.04] via-card to-card border border-border/60 px-5 py-5 sm:p-8">
        <div className="absolute -right-20 -top-20 size-56 rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute -bottom-10 -left-10 size-36 rounded-full bg-primary/[0.03] blur-2xl" />

        <div className="relative">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 sm:size-7">
              <Heart className="size-3 text-primary sm:size-3.5" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              MediCare AI
            </span>
          </div>

          {/* Welcome + desktop button */}
          <div className="mt-3 flex items-start justify-between gap-4 sm:mt-4">
            <div className="min-w-0">
              <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {patients.length}{" "}
                {patients.length === 1 ? "patient profile" : "patient profiles"}{" "}
                on file
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="hidden h-9 shrink-0 rounded-xl px-4 text-xs font-semibold shadow-xs sm:inline-flex"
            >
              <Link href="/dashboard/patients/new">
                <Plus className="mr-1.5 size-3.5" />
                Add patient
              </Link>
            </Button>
          </div>

          {/* Stats */}
          {patients.length > 0 && (
            <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 sm:mt-6 sm:grid-cols-3">
              <div className="bg-card px-3.5 py-3 sm:px-4 sm:py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Total Patients
                </p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  {patients.length}
                </p>
              </div>
              <div className="bg-card px-3.5 py-3 sm:px-4 sm:py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Combined Budget
                </p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  ₱{totalMonthlyBudget.toLocaleString()}
                </p>
              </div>
              <div className="bg-card px-3.5 py-3 sm:px-4 sm:py-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Avg. Budget
                </p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  ₱
                  {Math.round(
                    totalMonthlyBudget / patients.length,
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <Button
          asChild
          size="icon"
          className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Link href="/dashboard/patients/new">
            <Plus className="size-6" />
            <span className="sr-only">Add patient</span>
          </Link>
        </Button>
      </div>

      {/* Patient list */}
      <div className="space-y-4">
        <PatientList patients={patients} />
      </div>
    </div>
  );
}
