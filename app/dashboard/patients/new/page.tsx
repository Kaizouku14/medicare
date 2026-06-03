import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PatientForm } from "@/components/patients/forms/patient-form";

export default function NewPatientPage() {
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
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-medium">New Patient</CardTitle>
          <CardDescription>
            Add profile details, conditions, and care constraints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm />
        </CardContent>
      </Card>
    </div>
  );
}
