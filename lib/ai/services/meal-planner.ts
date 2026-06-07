import {
  type Patient,
  type FoodRecommendation,
  type DayMeal,
  type DocumentAnalysis,
} from "@/types/domain";
import { groqChat } from "@/lib/ai/groq-client";
import {
  type MedicationBrief,
  type DocAbnormal,
} from "@/lib/db/patients/context";
import { FOOD_REFERENCE_LIST } from "@/lib/foods/registry";
import { getFeedingMethodProfile } from "@/lib/foods/feeding-methods";
import { JSON_MODEL } from "@/lib/ai/models";

export function isFoodRecArray(v: unknown): v is FoodRecommendation[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    typeof v[0]?.name === "string" &&
    typeof v[0]?.description === "string" &&
    typeof v[0]?.estimatedCost === "number" &&
    (typeof v[0]?.nutrients === "string" ||
      typeof v[0]?.nutrients === "object") &&
    typeof v[0]?.reason === "string"
  );
}

export function isDayMealArray(v: unknown): v is DayMeal[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    typeof v[0]?.day === "string" &&
    typeof v[0]?.breakfast === "string" &&
    typeof v[0]?.lunch === "string" &&
    typeof v[0]?.dinner === "string" &&
    Array.isArray(v[0]?.snacks) &&
    typeof v[0]?.totalCost === "number"
  );
}



export async function generateFullMealPlan(
  patient: Patient,
  labData?: {
    extractedValues: DocumentAnalysis["extractedValues"];
    concerns: DocumentAnalysis["concerns"];
    dietaryConsiderations: DocumentAnalysis["dietaryConsiderations"];
  },
  medications?: MedicationBrief[],
  allAbnormalValues?: DocAbnormal[],
): Promise<{ recommendations: FoodRecommendation[]; meals: DayMeal[] }> {
  let labSection = "";
  if (labData) {
    labSection = `
Latest lab values:
${JSON.stringify(labData.extractedValues, null, 2)}

Clinical concerns from lab results:
${labData.concerns.map((c) => `- ${c}`).join("\n")}

Dietary considerations from lab results:
${labData.dietaryConsiderations}
`;
  }

  let medSection = "";
  if (medications && medications.length > 0) {
    medSection = `\n\nActive Medications:\n${medications.map((m) => `- ${m.name} ${m.dosage} — ${m.frequency}`).join("\n")}`;
  }

  let abnormalSection = "";
  if (allAbnormalValues && allAbnormalValues.length > 0) {
    abnormalSection = `\n\nAll Lab Results — Abnormal Values:\n${allAbnormalValues.map((doc) => `- ${doc.fileName}:\n${doc.values.map((v) => `  - ${v.name}: ${v.value} ${v.unit} (ref: ${v.referenceRange}) — ${v.interpretation}`).join("\n")}`).join("\n")}`;
  }

  const dailyBudget = Math.round(patient.monthlyBudgetPhp / 30);

  const foodRef = JSON.stringify(FOOD_REFERENCE_LIST);

  const prompt = `You are a Filipino clinical nutritionist and meal planner. Create a meal plan for a patient with the following profile:

- Name: ${patient.name}
- Age: ${patient.age}
- Height: ${patient.heightCm}
- Weight: ${patient.weightKg ? `${patient.weightKg} kg` : "Not specified"}
- BMI: ${patient.heightCm && patient.weightKg ? `${patient.weightKg / (patient.heightCm / 100) ** 2}` : "Not specified"}
- Diagnoses: ${patient.diagnoses.join(", ")}
- Feeding method: ${patient.feedingMethod} — ${getFeedingMethodProfile(patient.feedingMethod).texture}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Intolerances: ${patient.intolerances.join(", ") || "None"}
- Daily budget: ₱${dailyBudget} (monthly: ₱${patient.monthlyBudgetPhp})
${labSection}${medSection}${abnormalSection}

Food reference list (use these foodId values when recommending foods):
${foodRef}

Step 1 — Food Recommendations:
Recommend 8 affordable, nutritious foods from the food reference list. Every recommendation must include a foodId from the reference list. Consider medical conditions, feeding method, budget, allergies, intolerances, medications, and lab abnormalities. Use Filipino ingredients.

Step 2 — 7-Day Meal Plan:
Create a 7-day meal plan using ONLY the foods from Step 1. Each day has breakfast, lunch, dinner, and 1-2 snacks. Total daily cost must stay within ₱${dailyBudget}. Prep guidance: ${getFeedingMethodProfile(patient.feedingMethod).prepGuidance} Vary across the week.

Return a JSON object with two keys:
- "recommendations": array of exactly 8 objects, each with: "foodId" (string from the food reference list), "name", "description", "estimatedCost" (number), "nutrients" (string), "reason"
- "meals": array of exactly 7 objects (Monday to Sunday), each with: "day", "breakfast", "lunch", "dinner", "snacks" (array), "totalCost" (number), "recipes" (object)

If a food is not in the reference list, use "other" as foodId and set name to the food name.

Recipe format (each entry in the "recipes" object):
- "ingredients": Array of ingredient strings with amounts
- "instructions": Numbered cooking steps (3-6 steps) with timing. Include feeding-method prep in step 1 where needed (e.g. "Mince finely" for soft, "Blend until smooth" for pureed). Example: "1. Boil 2 cups water. 2. Add 1 cup rice, simmer 15 min. 3. Serve warm."
- "prepTime": Estimated prep time (e.g. "15 mins", "30 mins")

Example:
{"recommendations": [{"foodId": "tofu", "name": "Tofu", "description": "High-protein soy product", "estimatedCost": 15, "nutrients": "Protein, calcium, iron", "reason": "Suitable for diabetes management"}], "meals": [{"day": "Monday", "breakfast": "Chicken Adobo", "lunch": "Sinigang na Hipon", "dinner": "Tinolang Manok", "snacks": ["Banana"], "totalCost": 120, "recipes": {"breakfast": {"ingredients": ["1 cup rice", "2 eggs"], "instructions": "Cook rice. Fry eggs.", "prepTime": "15 mins"}, "lunch": {"ingredients": ["1 pc tilapia", "2 cups water", "1 pc onion"], "instructions": "Boil water. Add onion and fish. Simmer.", "prepTime": "20 mins"}, "dinner": {"ingredients": ["1 cup rice", "2 eggs"], "instructions": "Cook rice. Fry eggs.", "prepTime": "15 mins"}, "snack-0": {"ingredients": ["1 banana"], "instructions": "Peel and serve.", "prepTime": "2 mins"}}}]}

Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

  const content = await groqChat(
    [
      {
        role: "system",
        content:
          "You are a Filipino clinical nutritionist. Always respond with valid JSON inside a JSON object. No markdown, no code fences.",
      },
      { role: "user", content: prompt },
    ],
    JSON_MODEL,
    true,
  );

  for (let attempt = 1; attempt <= 2; attempt++) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      if (attempt === 2) throw new Error(
        `AI returned malformed JSON.\nPreview: ${content.slice(0, 300)}`,
      );
      continue;
    }

    const recommendations = isFoodRecArray(parsed.recommendations)
      ? parsed.recommendations
      : isFoodRecArray(parsed.items)
        ? parsed.items
        : null;

    const meals = isDayMealArray(parsed.meals)
      ? parsed.meals
      : isDayMealArray(parsed.mealPlan)
        ? parsed.mealPlan
        : isDayMealArray(parsed.plan)
          ? parsed.plan
          : null;

    if (!recommendations || !meals) {
      if (attempt === 2) throw new Error(
        `AI response missing recommendations or meals.\nKeys: ${Object.keys(parsed).join(", ")}\nPreview: ${JSON.stringify(parsed).slice(0, 300)}`,
      );
      continue;
    }

    return { recommendations, meals };
  }

  throw new Error("Unexpected: all retry attempts exhausted");
}
