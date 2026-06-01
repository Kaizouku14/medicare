import Link from "next/link";
import { Plus, Heart, Users, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { listPatientsByUser } from "@/lib/db/patients";
import { createClient } from "@/lib/supabase/server";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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

      {/* Patient list */}
      {patients.length === 0 ? (
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
          <Button asChild variant="default" size="lg" className="mt-2 h-10 rounded-xl px-5 shadow-xs">
            <Link href="/dashboard/patients/new">
              <Plus className="mr-2 size-4" />
              Add your first patient
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-foreground">
              Patient Profiles
            </h2>
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

          <div className="grid gap-3 sm:grid-cols-2">
            {patients.map((patient, i) => (
              <Link
                key={patient.id}
                href={`/dashboard/patients/${patient.id}`}
                className="group animate-fade-in-up relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/20 hover:shadow-sm"
                style={{ animationDelay: `${i * 0.05}s` }}
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
        </div>
      )}
    </div>
  );
}
