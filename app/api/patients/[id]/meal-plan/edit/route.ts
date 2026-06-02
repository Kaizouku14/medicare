import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import { getMealPlanById, toMealPlan } from "@/lib/db/meal-plans";
import { updateMealPlan } from "@/lib/db/meal-plans-edit";
import type { FoodRecommendation, DayMeal } from "@/types/domain";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, { params }: Params) {
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

  const body = (await req.json()) as {
    planId: string;
    recommendations: FoodRecommendation[];
    meals: DayMeal[];
  };

  if (!body.planId || !body.recommendations || !body.meals) {
    return NextResponse.json(
      { error: "planId, recommendations, and meals are required." },
      { status: 400 },
    );
  }

  const existing = await getMealPlanById(patient.id, body.planId);
  if (!existing) {
    return NextResponse.json(
      { error: "Meal plan not found." },
      { status: 404 },
    );
  }

  const totalDailyCost = Math.round(
    body.meals.reduce((sum, day) => sum + day.totalCost, 0) / body.meals.length,
  );

  const updated = await updateMealPlan(body.planId, {
    recommendations: body.recommendations,
    meals: body.meals,
    totalDailyCost,
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Failed to update meal plan." },
      { status: 500 },
    );
  }

  return NextResponse.json({ plan: toMealPlan(updated) });
}
