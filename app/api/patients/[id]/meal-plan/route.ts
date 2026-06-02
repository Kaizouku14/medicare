import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getLatestMealPlan, saveMealPlan, deleteMealPlan } from "@/lib/db/meal-plans";
import { buildPatientContext } from "@/lib/db/patient-context";
import {
  generateRecommendations,
  generateMealPlan,
} from "@/lib/ai/meal-planner";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);
    const plan = await getLatestMealPlan(patient.id);
    return NextResponse.json({ plan });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { allowed } = await rateLimit("meal-plan", { request, limit: 5, windowMs: 60000 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);
    const context = await buildPatientContext(user.id, patient.id);

    const labData = context.latestDocument
      ? {
          extractedValues: context.latestDocument.extractedValues,
          concerns: context.latestDocument.concerns,
          dietaryConsiderations: context.latestDocument.dietaryConsiderations,
        }
      : undefined;

    const medsOrUndefined = context.activeMedications.length > 0 ? context.activeMedications : undefined;
    const abnormalOrUndefined = context.allAbnormalValues.length > 0 ? context.allAbnormalValues : undefined;

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
    return handleApiError(error, "Unable to generate meal plan.");
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);

    const { planId } = (await req.json()) as { planId: string };
    if (!planId) {
      return NextResponse.json({ error: "planId is required." }, { status: 400 });
    }

    const deleted = await deleteMealPlan(patient.id, planId);
    if (!deleted) {
      return NextResponse.json({ error: "Meal plan not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
