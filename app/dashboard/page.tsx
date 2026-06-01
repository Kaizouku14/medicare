import Link from "next/link";
import { Plus, Heart } from "lucide-react";

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

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">
            Your patients
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {patients.length} {patients.length === 1 ? "profile" : "profiles"} on file
          </p>
        </div>
        <Button asChild size="sm" className="h-9 rounded-full px-4">
          <Link href="/dashboard/patients/new">
            <Plus data-icon="inline-start" />
            Add patient
          </Link>
        </Button>
      </div>

      {patients.length === 0 ? (
        <div className="animate-scale-in flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 py-20">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="size-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">No patients yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add your first patient profile to begin.
            </p>
          </div>
          <Button asChild variant="default" size="sm" className="mt-2 rounded-full">
            <Link href="/dashboard/patients/new">
              <Plus data-icon="inline-start" />
              Add your first patient
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {patients.map((patient, i) => (
            <Link
              key={patient.id}
              href={`/dashboard/patients/${patient.id}`}
              className="animate-fade-in-up group rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-10 rounded-xl">
                  <AvatarFallback className="rounded-xl text-xs font-bold bg-primary/10 text-primary">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">
                      {patient.name}
                    </h3>
                    <Badge variant="outline" className="shrink-0 text-[11px]">
                      ₱{patient.monthlyBudgetPhp.toLocaleString()}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {patient.age} years &middot; {patient.feedingMethod.replace("-", " · ")}
                    {patient.weightKg && ` &middot; ${patient.weightKg} kg`}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {patient.diagnoses.slice(0, 2).map((d) => (
                      <Badge key={d} variant="secondary" className="text-[11px]">
                        {d.replace(/-/g, " ")}
                      </Badge>
                    ))}
                    {patient.diagnoses.length > 2 && (
                      <Badge variant="outline" className="text-[11px]">
                        +{patient.diagnoses.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
