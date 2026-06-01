import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit3, Syringe, Weight, DollarSign, Tag } from "lucide-react";

import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PatientDetailPage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) {
    notFound();
  }

  return (
    <div className="animate-fade-in space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to patients
      </Link>

      <Card>
        <CardHeader className="border-b border-border/50 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl font-medium">
                {patient.name}
              </CardTitle>
              <CardDescription className="mt-1">
                Profile details and clinical constraints
              </CardDescription>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs">
                <Link href={`/dashboard/patients/${patient.id}/edit`}>
                  <Edit3 className="mr-1 size-3.5" />
                  Edit
                </Link>
              </Button>
              <DeletePatientButton patientId={patient.id} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Syringe className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Age
                </p>
                <p className="text-sm font-semibold">{patient.age} years</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Weight className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Weight
                </p>
                <p className="text-sm font-semibold">
                  {patient.weightKg ? `${patient.weightKg} kg` : "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Tag className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Feeding Method
                </p>
                <p className="text-sm font-semibold capitalize">{patient.feedingMethod}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <DollarSign className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Monthly Budget
                </p>
                <p className="text-sm font-semibold">
                  ₱{patient.monthlyBudgetPhp.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Diagnoses
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {patient.diagnoses.map((d) => (
                <span
                  key={d}
                  className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {d.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {(patient.allergies.length > 0 || patient.intolerances.length > 0) && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {patient.allergies.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Allergies
                  </h3>
                  <p className="mt-1.5 text-sm text-foreground">
                    {patient.allergies.join(", ")}
                  </p>
                </div>
              )}
              {patient.intolerances.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Intolerances
                  </h3>
                  <p className="mt-1.5 text-sm text-foreground">
                    {patient.intolerances.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
