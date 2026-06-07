import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import { groqChat } from "@/lib/ai/groq-client";
import { rateLimit } from "@/lib/rate-limit";
import { getFoodById, FOOD_REFERENCE_LIST } from "@/lib/foods/registry";
import { getFeedingMethodProfile } from "@/lib/foods/feeding-methods";
import { JSON_MODEL } from "@/lib/ai/models";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const { allowed } = await rateLimit("substitute", { request: req, limit: 10, windowMs: 60000 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);

    const body = (await req.json()) as { foodName?: string; foodId?: string };
    const foodName = body.foodId
      ? getFoodById(body.foodId)?.name ?? body.foodName ?? ""
      : body.foodName ?? "";

    if (!foodName) {
      return NextResponse.json({ error: "foodName or foodId is required." }, { status: 400 });
    }

    const foodRef = JSON.stringify(FOOD_REFERENCE_LIST);

    const content = await groqChat(
      [
        {
          role: "system",
          content:
            "You are a Filipino clinical nutritionist. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: `Suggest 2-3 affordable substitutes for "${foodName}" for this patient:

- Diagnoses: ${patient.diagnoses.join(", ")}
- Feeding method: ${patient.feedingMethod} — ${getFeedingMethodProfile(patient.feedingMethod).texture}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Intolerances: ${patient.intolerances.join(", ") || "None"}
- Daily budget: ₱${Math.round(patient.monthlyBudgetPhp / 30)}

Food reference list (use these foodId values when suggesting substitutes):
${foodRef}

Return a JSON object with a single key "substitutes" whose value is an array of objects.
Each object must have: "foodId" (string from the food reference list), "name", "description", "estimatedCost" (number in PHP), "nutrients" (string — key nutrients this food provides), "reason" (why this is suitable).

If a suggested substitute is not in the food reference list, use "other" as foodId.

Example: {"substitutes": [{"foodId": "tofu", "name": "Tofu", "description": "High-protein soy product", "estimatedCost": 15, "nutrients": "Protein, calcium, iron", "reason": "Suitable for diabetes management"}]}

Return ONLY valid JSON. No markdown, no code fences.`,
        },
      ],
      JSON_MODEL,
      true,
    );

    const parsed = JSON.parse(content);
    return NextResponse.json({ substitutes: parsed.substitutes ?? [] });
  } catch (err) {
    return handleApiError(err);
  }
}
