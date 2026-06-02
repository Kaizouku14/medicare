import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { getPatientById } from "@/lib/db/patients";
import { getLatestMealPlan, saveMealPlan } from "@/lib/db/meal-plans";
import {
  getLatestAnalyzedDocument,
  listDocumentsByPatient,
} from "@/lib/db/patient-documents";
import { listMedicationsByPatient } from "@/lib/db/medications";
import {
  generateRecommendations,
  generateMealPlan,
} from "@/lib/ai/meal-planner";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const plan = await getLatestMealPlan(patient.id);
  return NextResponse.json({ plan });
}

export async function POST(request: Request, { params }: Params) {
  const { allowed } = rateLimit(rateLimitKey(request, "meal-plan"), 5, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  try {
    const [latestDoc, allMeds, allDocuments] = await Promise.all([
      getLatestAnalyzedDocument(patient.id),
      listMedicationsByPatient(patient.id),
      listDocumentsByPatient(patient.id),
    ]);

    const labData = latestDoc?.analysis
      ? {
          extractedValues: latestDoc.analysis.extractedValues,
          concerns: latestDoc.analysis.concerns,
          dietaryConsiderations: latestDoc.analysis.dietaryConsiderations,
        }
      : undefined;

    const activeMeds = allMeds.filter(
      (m) => !m.endDate || new Date(m.endDate) >= new Date(),
    ).map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      route: m.route,
    }));

    const analyzedDocs = allDocuments.filter((d) => d.analysis);
    const allAbnormalValues = analyzedDocs
      .map((doc) => {
        const abnormal = (doc.analysis?.extractedValues ?? []).filter(
          (v) => v.isAbnormal,
        );
        return abnormal.length > 0
          ? { fileName: doc.fileName, values: abnormal }
          : null;
      })
      .filter(Boolean) as { fileName: string; values: { name: string; value: string; unit: string; referenceRange: string; interpretation: string }[] }[];

    const medsOrUndefined = activeMeds.length > 0 ? activeMeds : undefined;
    const abnormalOrUndefined = allAbnormalValues.length > 0 ? allAbnormalValues : undefined;

    const recommendations = await generateRecommendations(
      patient, labData, medsOrUndefined, abnormalOrUndefined,
    );
    const meals = await generateMealPlan(
      patient, recommendations, medsOrUndefined, abnormalOrUndefined,
    );

    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    const weekStart = monday.toISOString().split("T")[0];

    const totalDailyCost = Math.round(
      meals.reduce((sum, day) => sum + day.totalCost, 0) / meals.length,
    );

    const plan = await saveMealPlan(
      patient.id,
      weekStart,
      recommendations,
      meals,
      totalDailyCost,
    );

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate meal plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
