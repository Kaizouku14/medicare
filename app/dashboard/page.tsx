import Link from "next/link";
import { Plus, Heart, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    <div className="animate-fade-in space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border border-border/60 p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 size-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 size-36 rounded-full bg-secondary/20 blur-2xl" />

        <div className="relative flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="size-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                MediCare AI
              </span>
            </div>
            <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {patients.length}{" "}
              {patients.length === 1 ? "patient profile" : "patient profiles"}{" "}
              on file
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="h-9 shrink-0 rounded-xl px-4 text-xs font-semibold shadow-xs"
          >
            <Link href="/dashboard/patients/new">
              <Plus className="mr-1.5 size-3.5" />
              Add patient
            </Link>
          </Button>
        </div>

        {/* Stats */}
        {patients.length > 0 && (
          <div className="relative mt-6 grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 sm:grid-cols-3">
            <div className="bg-card px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Total Patients
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
                {patients.length}
              </p>
            </div>
            <div className="bg-card px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Combined Budget
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
                ₱{totalMonthlyBudget.toLocaleString()}
              </p>
            </div>
            <div className="bg-card px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Avg. Budget
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
                ₱
                {Math.round(totalMonthlyBudget / patients.length).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Patient list with search, filter, and pagination */}
      <div className="space-y-4">
        <PatientList patients={patients} />
      </div>
    </div>
  );
}
