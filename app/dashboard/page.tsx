import Link from "next/link";
import { Plus, User as UserIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listPatientsByUser } from "@/lib/db/patients";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const patients = await listPatientsByUser(user.id);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">
            Patients
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage profiles before generating meal plans.
          </p>
        </div>
        <Button asChild size="sm" className="h-9 rounded-full px-4">
          <Link href="/dashboard/patients/new">
            <Plus className="mr-1 size-4" />
            Add patient
          </Link>
        </Button>
      </div>

      {patients.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <UserIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No patients yet. Add your first patient to begin.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-1 rounded-full">
              <Link href="/dashboard/patients/new">Add your first patient</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {patients.map((patient, i) => (
            <Link
              key={patient.id}
              href={`/dashboard/patients/${patient.id}`}
              className="animate-fade-in-up group block rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-card-foreground">
                    {patient.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {patient.age} yrs &middot; {patient.diagnoses.slice(0, 2).join(", ")}
                    {patient.diagnoses.length > 2 && " + more"}
                  </p>
                </div>
                <div className="shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  ₱{patient.monthlyBudgetPhp.toLocaleString()}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>{patient.feedingMethod}</span>
                {patient.weightKg && <span>{patient.weightKg} kg</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
