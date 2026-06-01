import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import { DocumentUploader } from "@/components/documents/document-uploader";
import { DocumentList } from "@/components/documents/document-list";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { listDocumentsByPatient } from "@/lib/db/patient-documents";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DocumentsPage({ params }: Props) {
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

  const documents = await listDocumentsByPatient(patient.id);

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
        {/* Editorial header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-secondary/20">
                <FileText className="size-3.5 text-secondary-foreground" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary-foreground">
                Records
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
              Medical Documents
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload lab results and scan reports for AI analysis
            </p>
          </div>
        </div>

        {/* Patient context bar */}
        <div className="mt-6 rounded-xl border border-border/60 bg-card px-5 py-3.5">
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Patient:</span>{" "}
            {patient.name} &middot;{" "}
            <span className="font-semibold text-foreground">Diagnoses:</span>{" "}
            {patient.diagnoses.map((d) => d.replace(/-/g, " ")).join(", ")}
          </span>
        </div>

        {/* Uploader */}
        <div className="mt-8">
          <DocumentUploader patientId={patient.id} />
        </div>

        {/* Document list */}
        <div className="mt-8">
          <DocumentList documents={documents} patientId={patient.id} />
        </div>
      </div>
    </div>
  );
}
