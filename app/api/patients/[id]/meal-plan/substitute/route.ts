import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import { groqChat } from "@/lib/ai/groq-client";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);

    const { foodName } = (await req.json()) as { foodName?: string };
    if (!foodName) {
      return NextResponse.json({ error: "foodName is required." }, { status: 400 });
    }

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
- Feeding method: ${patient.feedingMethod}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Intolerances: ${patient.intolerances.join(", ") || "None"}
- Daily budget: ₱${Math.round(patient.monthlyBudgetPhp / 30)}

Return a JSON object with a single key "substitutes" whose value is an array of objects.
Each object must have: "name", "description", "estimatedCost" (number in PHP), "nutrients" (string — key nutrients this food provides), "reason" (why this is suitable).

Example: {"substitutes": [{"name": "Tofu", "description": "High-protein soy product", "estimatedCost": 15, "nutrients": "Protein, calcium, iron", "reason": "Suitable for diabetes management"}]}

Return ONLY valid JSON. No markdown, no code fences.`,
        },
      ],
      "llama-3.3-70b-versatile",
      true,
    );

    const parsed = JSON.parse(content);
    return NextResponse.json({ substitutes: parsed.substitutes ?? [] });
  } catch (err) {
    return handleApiError(err);
  }
}
