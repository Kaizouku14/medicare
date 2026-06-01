import { type Patient, type FoodRecommendation, type DayMeal } from "@/types/domain";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function groqChat(messages: GroqMessage[], responseFormat?: object) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: responseFormat ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: responseFormat ? 4096 : 2048,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function generateRecommendations(
  patient: Patient,
): Promise<FoodRecommendation[]> {
  const prompt = `You are a Filipino clinical nutritionist. Recommend affordable, nutritious foods for a patient with the following profile:

- Name: ${patient.name}
- Age: ${patient.age}
- Weight: ${patient.weightKg ? `${patient.weightKg} kg` : "Not specified"}
- Diagnoses: ${patient.diagnoses.join(", ")}
- Feeding method: ${patient.feedingMethod}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Intolerances: ${patient.intolerances.join(", ") || "None"}
- Daily budget: ₱${Math.round(patient.monthlyBudgetPhp / 30)} (monthly: ₱${patient.monthlyBudgetPhp})

Consider:
1. The patient's medical conditions — recommend foods that help manage them
2. Their feeding method — texture-appropriate foods
3. Budget constraints — affordable, locally available Filipino ingredients
4. Allergies and intolerances — strictly avoid these
5. High nutritional density — maximize nutrition per peso

Return a JSON array of exactly 8 food recommendations. Each item must have:
- "name": Food name in English or Tagalog
- "description": Brief description (1 sentence)
- "estimatedCost": Estimated cost in PHP per serving
- "nutrients": Key nutrients this food provides
- "reason": Why this is suitable for this patient's conditions

Return ONLY valid JSON, no markdown, no explanation.`;

  const content = await groqChat(
    [
      {
        role: "system",
        content:
          "You are a Filipino clinical nutritionist. Return ONLY valid JSON arrays. No markdown, no code fences, no explanation.",
      },
      { role: "user", content: prompt },
    ],
    { type: "json_object" },
  );

  const parsed = JSON.parse(content);
  return parsed as FoodRecommendation[];
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

Return a JSON array of exactly 7 objects (one per day, Monday to Sunday). Each object must have:
- "day": Day of week
- "breakfast": Meal name
- "lunch": Meal name
- "dinner": Meal name
- "snacks": Array of 1-2 snack names
- "totalCost": Estimated total cost for the day in PHP

Return ONLY valid JSON, no markdown, no explanation.`;

  const content = await groqChat(
    [
      {
        role: "system",
        content:
          "You are a Filipino meal planner. Return ONLY valid JSON arrays. No markdown, no code fences, no explanation.",
      },
      { role: "user", content: prompt },
    ],
    { type: "json_object" },
  );

  const parsed = JSON.parse(content);
  return parsed as DayMeal[];
}
