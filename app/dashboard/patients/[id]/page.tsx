import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit3, Syringe, Weight, DollarSign, Tag, Sparkles } from "lucide-react";

import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";

type Props = {
  params: Promise<{ id: string }>;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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
        <CardHeader className="pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-12 rounded-xl">
                <AvatarFallback className="rounded-xl text-base font-bold bg-primary/10 text-primary">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-serif text-2xl font-medium">
                  {patient.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  Profile details and clinical constraints
                </CardDescription>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs">
                <Link href={`/dashboard/patients/${patient.id}/edit`}>
                  <Edit3 data-icon="inline-start" />
                  Edit
                </Link>
              </Button>
              <DeletePatientButton patientId={patient.id} />
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
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
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Diagnoses
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {patient.diagnoses.map((d) => (
                <Badge key={d} variant="secondary">
                  {d.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="mb-6">
            <Button asChild variant="default" className="w-full rounded-full sm:w-auto">
              <Link href={`/dashboard/patients/${patient.id}/meal-plan`}>
                <Sparkles data-icon="inline-start" />
                Generate meal plan
              </Link>
            </Button>
          </div>

          <Separator className="mb-6" />

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Allergies
              </p>
              <p className="mt-2 text-sm text-foreground">
                {patient.allergies.length > 0
                  ? patient.allergies.join(", ")
                  : <span className="text-muted-foreground italic">None</span>}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Intolerances
              </p>
              <p className="mt-2 text-sm text-foreground">
                {patient.intolerances.length > 0
                  ? patient.intolerances.join(", ")
                  : <span className="text-muted-foreground italic">None</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
