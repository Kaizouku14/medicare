import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  CalendarDays,
  PhilippinePeso,
  FlaskConical,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { MealPlanGenerator } from "@/components/patients/meal-plans/meal-plan-generator";
import { MealPlanHistory } from "@/components/patients/meal-plans/meal-plan-history";
import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { getLatestAnalyzedDocument } from "@/lib/db/patients/documents";
import { getLatestMealPlan, listMealPlansByPatient } from "@/lib/db/meal-plans";

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

  const [latestDoc, existingPlan, allPlans] = await Promise.all([
    getLatestAnalyzedDocument(patient.id),
    getLatestMealPlan(patient.id),
    listMealPlansByPatient(patient.id),
  ]);
  const pastPlans = allPlans.filter((p) => p.id !== existingPlan?.id);

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
          icon={Sparkles}
          label="AI-Powered"
          title="Meal Plan"
          description={`Personalized weekly nutrition based on ${patient.name}'s clinical profile`}
        />

        {/* Patient context bar */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/60 bg-card px-5 py-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Diagnoses:</span>{" "}
            {patient.diagnoses.map((d) => d.replace(/-/g, " ")).join(", ")}
          </span>
          <span className="hidden size-1 rounded-full bg-border sm:inline" />
          <span className="inline-flex items-center text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Budget:</span>{" "}
            <PhilippinePeso className="size-3" />
            {patient.monthlyBudgetPhp.toLocaleString()}/mo
          </span>
          <span className="hidden size-1 rounded-full bg-border sm:inline" />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Feeding:</span>{" "}
            {patient.feedingMethod.replace("-", " + ")}
          </span>
          {latestDoc && (
            <>
              <span className="hidden size-1 rounded-full bg-border sm:inline" />
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="flex size-4 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-bold text-emerald-700">
                  <FlaskConical className="size-3" />
                </span>
                Lab data from{" "}
                {new Date(latestDoc.analyzedAt!).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </>
          )}
          {pastPlans.length > 0 && (
            <>
              <span className="hidden size-1 rounded-full bg-border sm:inline" />
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3" />
                {pastPlans.length} past{" "}
                {pastPlans.length === 1 ? "plan" : "plans"}
              </span>
            </>
          )}
        </div>

        {/* Two-column layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MealPlanGenerator
              patient={patient}
              latestDoc={latestDoc}
              existingPlan={existingPlan}
            />
          </div>

          {pastPlans.length > 0 && (
            <div className="lg:col-span-1">
              <MealPlanHistory patientId={patient.id} pastPlans={pastPlans} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
