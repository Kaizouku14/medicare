import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, HeartPulse } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { MedicationTracker } from "@/components/patients/trackers/medication-tracker";
import { VisitNotes } from "@/components/patients/trackers/visit-notes";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { listMedicationsByPatient } from "@/lib/db/tracking/medications";
import { listVisitNotesByPatient } from "@/lib/db/tracking/visit-notes";

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

  const activeCount = medications.filter(
    (m) => !m.endDate || m.endDate >= new Date().toISOString().split("T")[0]
  ).length;

  return (
    <div className="animate-fade-in">
      <Link
        href={`/dashboard/patients/${patient.id}`}
        className="group inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        {patient.name} Â· Profile
      </Link>

      <div className="mt-6">
        <PageHeader
          icon={HeartPulse}
          label="Care"
          title="Medications & Visits"
          description={`Track medications and log visit notes for ${patient.name}`}
        />

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/60 bg-card px-5 py-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Patient:</span>{" "}
            {patient.name}
          </span>
          <span className="hidden size-1 rounded-full bg-border sm:inline" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Active medications:</span>{" "}
            {activeCount}
          </span>
          <span className="hidden size-1 rounded-full bg-border sm:inline" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Visits logged:</span>{" "}
            {visits.length}
          </span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <MedicationTracker
              patientId={patient.id}
              initialMedications={medications}
            />
            <Link
              href={`/dashboard/patients/${patient.id}/medications`}
              className="block text-center text-[11px] font-medium text-primary/70 hover:text-primary transition-colors"
            >
              View full medication schedule &rarr;
            </Link>
          </div>
          <VisitNotes
            patientId={patient.id}
            initialVisits={visits}
          />
        </div>
      </div>
    </div>
  );
}
