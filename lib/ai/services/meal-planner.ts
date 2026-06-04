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

const JSON_MODEL = "llama-3.3-70b-versatile";

function isFoodRecArray(v: unknown): v is FoodRecommendation[] {
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

function isDayMealArray(v: unknown): v is DayMeal[] {
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

async function generateRecommendations(
  patient: Patient,
  labData?: {
    extractedValues: DocumentAnalysis["extractedValues"];
    concerns: DocumentAnalysis["concerns"];
    dietaryConsiderations: DocumentAnalysis["dietaryConsiderations"];
  },
  medications?: MedicationBrief[],
  allAbnormalValues?: DocAbnormal[],
): Promise<FoodRecommendation[]> {
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

  const considerations = [
    "The patient's medical conditions — recommend foods that help manage them",
    "Their feeding method — texture-appropriate foods",
    "Budget constraints — affordable, locally available Filipino ingredients",
    "Allergies and intolerances — strictly avoid these",
    "High nutritional density — maximize nutrition per peso",
    "Active medications and lab abnormalities — recommend foods that don't interfere with medications and help address abnormal values",
  ];

  const prompt = `You are a Filipino clinical nutritionist. Recommend affordable, nutritious foods for a patient with the following profile:

- Name: ${patient.name}
- Age: ${patient.age}
- Height: ${patient.heightCm}
- Weight: ${patient.weightKg ? `${patient.weightKg} kg` : "Not specified"}
- BMI: ${patient.heightCm && patient.weightKg ? `${patient.weightKg / (patient.heightCm / 100) ** 2}` : "Not specified"}
- Diagnoses: ${patient.diagnoses.join(", ")}
- Feeding method: ${patient.feedingMethod}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Intolerances: ${patient.intolerances.join(", ") || "None"}
- Daily budget: ₱${Math.round(patient.monthlyBudgetPhp / 30)} (monthly: ₱${patient.monthlyBudgetPhp})
${labSection}${medSection}${abnormalSection}
Consider:
${considerations.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Return a JSON object with a single key "recommendations" whose value is an array of exactly 8 food recommendation objects. Each object must have:
- "name": Food name in English or Tagalog
- "description": Brief description (1 sentence)
- "estimatedCost": Estimated cost in PHP per serving (number)
- "nutrients": Key nutrients this food provides
- "reason": Why this is suitable for this patient's conditions

Example format:
{"recommendations": [{"name": "...", "description": "...", "estimatedCost": 15, "nutrients": "...", "reason": "..."}]}

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

  const parsed = JSON.parse(content);
  const recommendations = isFoodRecArray(parsed)
    ? parsed
    : isFoodRecArray(parsed.recommendations)
      ? parsed.recommendations
      : isFoodRecArray(parsed.items)
        ? parsed.items
        : null;

  if (!recommendations) {
    throw new Error(
      `AI response did not contain a valid recommendations array.\nKeys: ${Object.keys(parsed).join(", ")}\nPreview: ${JSON.stringify(parsed).slice(0, 300)}`,
    );
  }

  return recommendations;
}

async function generateMealPlan(
  patient: Patient,
  recommendations: FoodRecommendation[],
  medications?: MedicationBrief[],
  allAbnormalValues?: DocAbnormal[],
): Promise<DayMeal[]> {
  const foodsJson = JSON.stringify(recommendations, null, 2);
  const dailyBudget = Math.round(patient.monthlyBudgetPhp / 30);

  let medSection = "";
  if (medications && medications.length > 0) {
    medSection = `\n\nActive Medications:\n${medications.map((m) => `- ${m.name} ${m.dosage} — ${m.frequency}`).join("\n")}`;
  }

  let abnormalSection = "";
  if (allAbnormalValues && allAbnormalValues.length > 0) {
    abnormalSection = `\n\nAll Lab Results — Abnormal Values:\n${allAbnormalValues.map((doc) => `- ${doc.fileName}:\n${doc.values.map((v) => `  - ${v.name}: ${v.value} ${v.unit} (ref: ${v.referenceRange}) — ${v.interpretation}`).join("\n")}`).join("\n")}`;
  }

  const prompt = `You are a Filipino meal planner. Create a 7-day meal plan for this patient:

- Name: ${patient.name}
- Age: ${patient.age}
- Diagnoses: ${patient.diagnoses.join(", ")}
- Feeding method: ${patient.feedingMethod}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Intolerances: ${patient.intolerances.join(", ") || "None"}
- Daily budget: ₱${dailyBudget}
${medSection}${abnormalSection}
Approved foods to use:
${foodsJson}

Rules:
1. Each day has breakfast, lunch, dinner, and 1-2 snacks
2. Total daily cost must stay within ₱${dailyBudget}
3. Meals must be texture-appropriate for ${patient.feedingMethod} feeding
4. Use Filipino dishes and ingredients that are familiar and affordable
5. Vary the meals across the week — don't repeat the same dish
6. Avoid all listed allergies and intolerances
7. Meal timing and portion sizes should account for the patient's medication schedule and lab abnormalities listed above

Return a JSON object with a single key "meals" whose value is an array of exactly 7 objects (one per day, Monday to Sunday). Each object must have:
- "day": Day of week (e.g. "Monday")
- "breakfast": Meal name
- "lunch": Meal name
- "dinner": Meal name
- "snacks": Array of 1-2 snack names
- "totalCost": Estimated total cost for the day in PHP (number)
- "recipes": Object where keys are meal identifiers ("breakfast", "lunch", "dinner", "snack-0", etc.) and values are recipe objects with:
  - "ingredients": Array of ingredient strings with amounts
  - "instructions": Step-by-step cooking instructions as a single string
  - "prepTime": Estimated prep time (e.g. "15 mins", "30 mins")

Example format:
{"meals": [{"day": "Monday", "breakfast": "Chicken Adobo", "lunch": "Sinigang na Hipon", "dinner": "Tinolang Manok", "snacks": ["Banana", "Saging"], "totalCost": 120, "recipes": {"breakfast": {"ingredients": ["1 cup rice", "2 eggs"], "instructions": "Cook rice. Fry eggs. Serve together.", "prepTime": "15 mins"}, "lunch": {"ingredients": ["1 pc tilapia", "2 cups water", "1 pc onion"], "instructions": "Boil water. Add onion and fish. Simmer.", "prepTime": "20 mins"}, "dinner": {"ingredients": ["1 cup rice", "2 eggs"], "instructions": "Cook rice. Fry eggs. Serve together.", "prepTime": "15 mins"}, "snack-0": {"ingredients": ["1 banana"], "instructions": "Peel and serve.", "prepTime": "2 mins"}}}]}

Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

  const content = await groqChat(
    [
      {
        role: "system",
        content:
          "You are a Filipino meal planner. Always respond with valid JSON inside a JSON object. No markdown, no code fences.",
      },
      { role: "user", content: prompt },
    ],
    JSON_MODEL,
    true,
  );

  const parsed = JSON.parse(content);
  const meals = isDayMealArray(parsed)
    ? parsed
    : isDayMealArray(parsed.meals)
      ? parsed.meals
      : isDayMealArray(parsed.mealPlan)
        ? parsed.mealPlan
        : isDayMealArray(parsed.plan)
          ? parsed.plan
          : null;

  if (!meals) {
    throw new Error(
      `AI response did not contain a valid meals array.\nKeys: ${Object.keys(parsed).join(", ")}\nPreview: ${JSON.stringify(parsed).slice(0, 300)}`,
    );
  }

  return meals;
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
- Feeding method: ${patient.feedingMethod}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Intolerances: ${patient.intolerances.join(", ") || "None"}
- Daily budget: ₱${dailyBudget} (monthly: ₱${patient.monthlyBudgetPhp})
${labSection}${medSection}${abnormalSection}

Food reference list (use these foodId values when recommending foods):
${foodRef}

Step 1 — Food Recommendations:
Recommend 8 affordable, nutritious foods from the food reference list. Consider medical conditions, feeding method, budget, allergies, intolerances, medications, and lab abnormalities. Use Filipino ingredients.

Step 2 — 7-Day Meal Plan:
Create a 7-day meal plan using ONLY the foods from Step 1. Each day has breakfast, lunch, dinner, and 1-2 snacks. Total daily cost must stay within ₱${dailyBudget}. Meals must be texture-appropriate for ${patient.feedingMethod} feeding. Vary across the week.

Return a JSON object with two keys:
- "recommendations": array of exactly 8 objects, each with: "foodId" (string from the food reference list), "name", "description", "estimatedCost" (number), "nutrients" (string), "reason"
- "meals": array of exactly 7 objects (Monday to Sunday), each with: "day", "breakfast", "lunch", "dinner", "snacks" (array), "totalCost" (number), "recipes" (object)

If a food is not in the reference list, use "other" as foodId and set name to the food name.

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

  const parsed = JSON.parse(content);
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
    throw new Error(
      `AI response missing recommendations or meals.\nKeys: ${Object.keys(parsed).join(", ")}\nPreview: ${JSON.stringify(parsed).slice(0, 300)}`,
    );
  }

  return { recommendations, meals };
}
