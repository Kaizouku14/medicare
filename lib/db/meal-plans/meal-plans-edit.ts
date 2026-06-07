import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { mealPlans } from "@/lib/db/schema/schema";
import type { FoodRecommendation, DayMeal } from "@/types/domain";

export async function updateMealPlan(
  planId: string,
  patientId: string,
  data: {
    recommendations: FoodRecommendation[];
    meals: DayMeal[];
    averageDailyCost: number | null;
  },
) {
  const [row] = await db
    .update(mealPlans)
    .set({
      recommendations: data.recommendations,
      meals: data.meals,
      averageDailyCost: data.averageDailyCost?.toString() ?? null,
    })
    .where(and(eq(mealPlans.id, planId), eq(mealPlans.patientId, patientId)))
    .returning();

  return row ?? null;
}
