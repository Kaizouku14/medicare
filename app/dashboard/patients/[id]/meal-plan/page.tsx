import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

import { MealPlanGenerator } from "@/components/patients/meal-plan-generator";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { getLatestAnalyzedDocument } from "@/lib/db/patient-documents";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MealPlanPage({ params }: Props) {
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

  const latestDoc = await getLatestAnalyzedDocument(patient.id);

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
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                AI-Powered
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
              Meal Plan
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Personalized weekly nutrition based on {patient.name}&apos;s clinical profile
            </p>
          </div>
        </div>

        {/* Patient context bar */}
        <div className="mt-6 flex flex-wrap gap-3 rounded-xl border border-border/60 bg-card px-5 py-3.5">
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Diagnoses:</span>{" "}
            {patient.diagnoses.map((d) => d.replace(/-/g, " ")).join(", ")}
          </span>
          <span className="hidden text-muted-foreground/30 sm:inline">|</span>
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Budget:</span> ₱
            {patient.monthlyBudgetPhp.toLocaleString()}/mo
          </span>
          <span className="hidden text-muted-foreground/30 sm:inline">|</span>
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Feeding:</span>{" "}
            {patient.feedingMethod.replace("-", " + ")}
          </span>
          {latestDoc && (
            <>
              <span className="hidden text-muted-foreground/30 sm:inline">|</span>
              <span className="text-xs text-emerald-600">
                ✓ Lab data from{" "}
                {new Date(latestDoc.analyzedAt!).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </>
          )}
        </div>

        {/* Generator */}
        <div className="mt-8">
          <MealPlanGenerator patient={patient} latestDoc={latestDoc} />
        </div>
      </div>
    </div>
  );
}
