import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { mealPlans } from "@/lib/db/schema/schema";
import { type FoodRecommendation, type DayMeal, type MealPlan } from "@/types/domain";

export function toMealPlan(row: typeof mealPlans.$inferSelect): MealPlan {
  return {
    id: row.id,
    patientId: row.patientId,
    weekStart: row.weekStart,
    recommendations: row.recommendations as FoodRecommendation[],
    meals: row.meals as DayMeal[],
    averageDailyCost: row.averageDailyCost ? Number(row.averageDailyCost) : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function saveMealPlan(
  patientId: string,
  weekStart: string,
  recommendations: FoodRecommendation[],
  meals: DayMeal[],
  averageDailyCost: number | null,
) {
  const [row] = await db
    .insert(mealPlans)
    .values({
      patientId,
      weekStart,
      recommendations,
      meals,
      averageDailyCost: averageDailyCost?.toString() ?? null,
    })
    .onConflictDoUpdate({
      target: [mealPlans.patientId, mealPlans.weekStart],
      set: {
        recommendations,
        meals,
        averageDailyCost: averageDailyCost?.toString() ?? null,
      },
    })
    .returning();

  return toMealPlan(row);
}

export async function getLatestMealPlan(patientId: string) {
  const [row] = await db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.patientId, patientId))
    .orderBy(desc(mealPlans.createdAt))
    .limit(1);

  return row ? toMealPlan(row) : null;
}

export async function listMealPlansByPatient(patientId: string, limit = 20) {
  const rows = await db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.patientId, patientId))
    .orderBy(desc(mealPlans.createdAt))
    .limit(limit);

  return rows.map(toMealPlan);
}

export async function getMealPlanById(patientId: string, planId: string) {
  const [row] = await db
    .select()
    .from(mealPlans)
    .where(and(eq(mealPlans.id, planId), eq(mealPlans.patientId, patientId)))
    .limit(1);

  return row ? toMealPlan(row) : null;
}

export async function deleteMealPlan(patientId: string, planId: string) {
  const [row] = await db
    .delete(mealPlans)
    .where(and(eq(mealPlans.id, planId), eq(mealPlans.patientId, patientId)))
    .returning({ id: mealPlans.id });
  return !!row;
}
