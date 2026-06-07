import type { FoodRecommendation, DayMeal } from "@/types/domain";

export function replaceFoodInMeals(
  meals: DayMeal[],
  oldName: string,
  newName: string,
  recommendations: FoodRecommendation[],
  oldFoodId?: string,
): DayMeal[] {
  const matchName = oldFoodId
    ? (name: string) => {
        const entry = recommendations.find((r) => r.foodId === oldFoodId);
        return entry ? entry.name === name : name === oldName;
      }
    : (name: string) => name === oldName;
  return meals.map((day) => ({
    ...day,
    breakfast: matchName(day.breakfast) ? newName : day.breakfast,
    lunch: matchName(day.lunch) ? newName : day.lunch,
    dinner: matchName(day.dinner) ? newName : day.dinner,
    snacks: day.snacks.map((s) => (matchName(s) ? newName : s)),
  }));
}
