import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { getPatientById } from "@/lib/db/patients";
import { getLatestMealPlan, saveMealPlan } from "@/lib/db/meal-plans";
import { getLatestAnalyzedDocument } from "@/lib/db/patient-documents";
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
    const latestDoc = await getLatestAnalyzedDocument(patient.id);
    const labData = latestDoc?.analysis
      ? {
          extractedValues: latestDoc.analysis.extractedValues,
          concerns: latestDoc.analysis.concerns,
          dietaryConsiderations: latestDoc.analysis.dietaryConsiderations,
        }
      : undefined;

    const recommendations = await generateRecommendations(patient, labData);
    const meals = await generateMealPlan(patient, recommendations);

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
