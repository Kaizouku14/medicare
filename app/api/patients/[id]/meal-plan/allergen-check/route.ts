import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import { groqChat } from "@/lib/ai/groq-client";
import { getLatestMealPlan } from "@/lib/db/meal-plans";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const patient = await requirePatientAccess(user.id, id);

    const plan = await getLatestMealPlan(patient.id);
    if (!plan) {
      return NextResponse.json({ error: "No meal plan found." }, { status: 404 });
    }

    const content = await groqChat(
      [
        {
          role: "system",
          content:
            "You are a clinical nutritionist specializing in food allergies. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: `Check this meal plan against the patient's allergies and intolerances.

Patient allergies: ${patient.allergies.join(", ") || "None"}
Patient intolerances: ${patient.intolerances.join(", ") || "None"}

Meal plan meals:
${plan.meals.map((day) => `${day.day}:
  Breakfast: ${day.breakfast}
  Lunch: ${day.lunch}
  Dinner: ${day.dinner}
  Snacks: ${day.snacks.join(", ")}`).join("\n")}

Recommended foods: ${plan.recommendations.map((f) => f.name).join(", ")}

Return a JSON object with:
- "hasIssues" (boolean): true if any allergen/intolerance concern is found
- "concerns" (array of objects): each with "food" (string), "allergen" (string), "severity" ("high" | "medium" | "low"), "suggestion" (string)

Only flag foods that contain or may contain the patient's listed allergens. Be conservative — if a food commonly contains an allergen, flag it.

Example: {"hasIssues": true, "concerns": [{"food": "Ginataang Manok", "allergen": "dairy", "severity": "high", "suggestion": "Replace coconut cream with a dairy-free alternative or use thin coconut milk"}]}

Return ONLY valid JSON. No markdown, no code fences.`,
        },
      ],
      "llama-3.3-70b-versatile",
      true,
    );

    const parsed = JSON.parse(content) as {
      hasIssues: boolean;
      concerns: Array<{ food: string; allergen: string; severity: string; suggestion: string }>;
    };

    return NextResponse.json({
      hasIssues: parsed.hasIssues ?? false,
      concerns: parsed.concerns ?? [],
    });
  } catch (err) {
    return handleApiError(err);
  }
}