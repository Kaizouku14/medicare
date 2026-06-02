import {
  type Patient,
  type FoodRecommendation,
  type DayMeal,
  type DocumentAnalysis,
} from "@/types/domain";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const JSON_MODEL = "llama-3.3-70b-versatile";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function isFoodRecArray(v: unknown): v is FoodRecommendation[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    typeof v[0]?.name === "string" &&
    typeof v[0]?.description === "string" &&
    typeof v[0]?.estimatedCost === "number" &&
    (typeof v[0]?.nutrients === "string" || typeof v[0]?.nutrients === "object") &&
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

async function groqChat(
  messages: GroqMessage[],
  model: string,
  jsonMode: boolean,
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not configured. Set it in your .env file.",
    );
  }

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: jsonMode ? 4096 : 2048,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  return content;
}

export async function generateRecommendations(
  patient: Patient,
  labData?: {
    extractedValues: DocumentAnalysis["extractedValues"];
    concerns: DocumentAnalysis["concerns"];
    dietaryConsiderations: DocumentAnalysis["dietaryConsiderations"];
  },
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
${labSection}
Consider:
1. The patient's medical conditions — recommend foods that help manage them
2. Their feeding method — texture-appropriate foods
3. Budget constraints — affordable, locally available Filipino ingredients
4. Allergies and intolerances — strictly avoid these
5. High nutritional density — maximize nutrition per peso

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

export async function generateMealPlan(
  patient: Patient,
  recommendations: FoodRecommendation[],
): Promise<DayMeal[]> {
  const foodsJson = JSON.stringify(recommendations, null, 2);
  const dailyBudget = Math.round(patient.monthlyBudgetPhp / 30);

  const prompt = `You are a Filipino meal planner. Create a 7-day meal plan for this patient:

- Name: ${patient.name}
- Age: ${patient.age}
- Diagnoses: ${patient.diagnoses.join(", ")}
- Feeding method: ${patient.feedingMethod}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Intolerances: ${patient.intolerances.join(", ") || "None"}
- Daily budget: ₱${dailyBudget}

Approved foods to use:
${foodsJson}

Rules:
1. Each day has breakfast, lunch, dinner, and 1-2 snacks
2. Total daily cost must stay within ₱${dailyBudget}
3. Meals must be texture-appropriate for ${patient.feedingMethod} feeding
4. Use Filipino dishes and ingredients that are familiar and affordable
5. Vary the meals across the week — don't repeat the same dish
6. Avoid all listed allergies and intolerances

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
{"meals": [{"day": "Monday", "breakfast": "Chicken Adobo", "lunch": "Sinigang na Hipon", "dinner": "Tinolang Manok", "snacks": ["Banana", "Saging"], "totalCost": 120, "recipes": {"breakfast": {"ingredients": ["1 cup rice", "2 eggs"], "instructions": "Cook rice. Fry eggs. Serve together.", "prepTime": "15 mins"}}}]}

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
