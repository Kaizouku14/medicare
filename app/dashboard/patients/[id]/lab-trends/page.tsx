import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { LabTrends } from "@/components/patients/trackers/lab-trends";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { listDocumentsByPatient } from "@/lib/db/patients/documents";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LabTrendsPage({ params }: Props) {
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
  const analyzedDocs = documents.filter((d) => d.analysis);

  return (
    <div className="animate-fade-in">
      <Link
        href={`/dashboard/patients/${patient.id}`}
        className="group inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        {patient.name} · Profile
      </Link>

      <div className="mt-6">
        <PageHeader
          icon={Activity}
          label="Trends"
          title="Lab Value Trends"
          description="Track lab results over time across all uploaded documents"
        />

        <div className="mt-6 flex flex-col gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:px-5 sm:py-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Patient:</span>{" "}
            {patient.name}
          </span>
          <span className="hidden size-1 rounded-full bg-border sm:inline" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Analyzed documents:
            </span>{" "}
            {analyzedDocs.length}
          </span>
        </div>

        <div className="mt-8">
          <LabTrends documents={analyzedDocs} />
        </div>
      </div>
    </div>
  );
}
