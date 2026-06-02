import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, HeartPulse } from "lucide-react";

import { MedicationTracker } from "@/components/patients/medication-tracker";
import { VisitNotes } from "@/components/patients/visit-notes";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { listMedicationsByPatient } from "@/lib/db/medications";
import { listVisitNotesByPatient } from "@/lib/db/visit-notes";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CarePage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) notFound();

  const [medications, visits] = await Promise.all([
    listMedicationsByPatient(patient.id),
    listVisitNotesByPatient(patient.id),
  ]);

  return (
    <div className="animate-fade-in">
      <Link
        href={`/dashboard/patients/${patient.id}`}
        className="group inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        {patient.name} — Profile
      </Link>

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-secondary/20">
                <HeartPulse className="size-3.5 text-secondary-foreground" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary-foreground">
                Care
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
              Medications &amp; Visits
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track medications and log visit notes for {patient.name}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border/60 bg-card px-5 py-3.5">
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Patient:</span>{" "}
            {patient.name} &middot;{" "}
            <span className="font-semibold text-foreground">Active medications:</span>{" "}
            {medications.filter((m) => !m.endDate || m.endDate >= new Date().toISOString().split("T")[0]).length}
            &middot;{" "}
            <span className="font-semibold text-foreground">Visits logged:</span> {visits.length}
          </span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <MedicationTracker
            patientId={patient.id}
            initialMedications={medications}
          />
          <VisitNotes
            patientId={patient.id}
            initialVisits={visits}
          />
        </div>
      </div>
    </div>
  );
}
