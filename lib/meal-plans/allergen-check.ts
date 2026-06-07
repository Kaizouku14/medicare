import { getFoodById } from "@/lib/foods/registry";
import type { FoodRecommendation, DayMeal } from "@/types/domain";

type AllergenConcern = {
  food: string;
  allergen: string;
  severity: "high" | "medium" | "low";
  suggestion: string;
};

type AllergenCheckResult = {
  hasIssues: boolean;
  concerns: AllergenConcern[];
};

const ALLERGEN_PATTERNS: Record<string, { tag: string; severity: "high" | "medium"; suggestion: string }[]> = {
  seafood: [
    { tag: "seafood", severity: "high", suggestion: "Replace with a lean protein like chicken or tofu." },
    { tag: "fish", severity: "high", suggestion: "Replace with a non-seafood protein source." },
  ],
  dairy: [
    { tag: "dairy", severity: "high", suggestion: "Replace with a dairy-free alternative like coconut milk." },
  ],
  soy: [
    { tag: "soy", severity: "high", suggestion: "Replace with a non-soy protein like chicken or fish." },
  ],
  egg: [
    { tag: "egg", severity: "high", suggestion: "Replace with a non-egg breakfast option like oatmeal or lugaw." },
  ],
};

function matchAllergen(foodName: string, allergen: string, tags: string[]): boolean {
  const patterns = ALLERGEN_PATTERNS[allergen];
  if (!patterns) return false;
  return patterns.some((p) => tags.includes(p.tag) || foodName.toLowerCase().includes(p.tag));
}

export function checkAllergens(
  allergies: string[],
  intolerances: string[],
  recommendations: FoodRecommendation[],
  meals: DayMeal[],
): AllergenCheckResult {
  const concerns: AllergenConcern[] = [];
  const allAllergens = [...new Set([...allergies, ...intolerances])];

  const allMealNames = new Set<string>();
  for (const day of meals) {
    allMealNames.add(day.breakfast);
    allMealNames.add(day.lunch);
    allMealNames.add(day.dinner);
    for (const snack of day.snacks) {
      allMealNames.add(snack);
    }
  }

  for (const food of recommendations) {
    const profile = getFoodById(food.foodId);
    const tags = profile?.tags ?? [];

    for (const allergen of allAllergens) {
      const allergenLower = allergen.toLowerCase().trim();
      if (matchAllergen(food.name, allergenLower, tags)) {
        const patterns = ALLERGEN_PATTERNS[allergenLower];
        const pattern = patterns?.[0];
        concerns.push({
          food: food.name,
          allergen,
          severity: pattern?.severity ?? "medium",
          suggestion: pattern?.suggestion ?? "Consider a substitute.",
        });
      }
    }
  }

  for (const mealName of allMealNames) {
    for (const allergen of allAllergens) {
      const allergenLower = allergen.toLowerCase().trim();
      if (mealName.toLowerCase().includes(allergenLower)) {
        concerns.push({
          food: mealName,
          allergen,
          severity: "low",
          suggestion: `Check if this meal contains ${allergen}.`,
        });
      }
    }
  }

  return {
    hasIssues: concerns.length > 0,
    concerns,
  };
}
