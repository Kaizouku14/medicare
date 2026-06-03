import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { DocumentUploader } from "@/components/documents/document-uploader";
import { DocumentList } from "@/components/documents/document-list";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { listDocumentsByPatient } from "@/lib/db/patients/documents";

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

  const adminSupabase = createAdminClient();
  const signedUrls = new Map<string, string>();
  await Promise.all(
    documents.map((doc) =>
      adminSupabase.storage
        .from("patient-documents")
        .createSignedUrl(doc.storagePath, 3600)
        .then(({ data }) => data && signedUrls.set(doc.id, data.signedUrl)),
    ),
  );

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
          icon={FileText}
          label="Records"
          title="Medical Documents"
          description="Upload lab results and scan reports for AI analysis"
        />

        {/* Patient context bar */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/60 bg-card px-5 py-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Patient:</span>{" "}
            {patient.name}
          </span>
          <span className="hidden size-1 rounded-full bg-border sm:inline" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
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
          <DocumentList
            documents={documents}
            patientId={patient.id}
            signedUrls={signedUrls}
          />
        </div>
      </div>
    </div>
  );
}
