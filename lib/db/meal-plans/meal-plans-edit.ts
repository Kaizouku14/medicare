import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { mealPlans } from "@/lib/db/schema/schema";
import type { FoodRecommendation, DayMeal } from "@/types/domain";

export async function updateMealPlan(
  planId: string,
  data: {
    recommendations: FoodRecommendation[];
    meals: DayMeal[];
    totalDailyCost: number | null;
  },
) {
  const [row] = await db
    .update(mealPlans)
    .set({
      recommendations: data.recommendations,
      meals: data.meals,
      totalDailyCost: data.totalDailyCost?.toString() ?? null,
    })
    .where(eq(mealPlans.id, planId))
    .returning();

  return row ?? null;
}
