import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PatientForm } from "@/components/patients/forms/patient-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPatientPage({ params }: Props) {
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
        href={`/dashboard/patients/${patient.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to {patient.name}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-medium">Edit Patient</CardTitle>
          <CardDescription>
            Update {patient.name}&apos;s profile and constraints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm
            patientId={patient.id}
            defaultValue={{
              name: patient.name,
              age: patient.age,
              weightKg: patient.weightKg,
              diagnoses: patient.diagnoses,
              feedingMethod: patient.feedingMethod,
              allergies: patient.allergies,
              intolerances: patient.intolerances,
              monthlyBudgetPhp: patient.monthlyBudgetPhp,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
