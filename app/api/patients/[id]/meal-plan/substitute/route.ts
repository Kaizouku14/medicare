import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  const { foodName } = (await req.json()) as { foodName?: string };
  if (!foodName) return NextResponse.json({ error: "foodName is required." }, { status: 400 });

  const prompt = `You are a Filipino clinical nutritionist. Suggest 2-3 affordable substitutes for "${foodName}" for this patient:

- Diagnoses: ${patient.diagnoses.join(", ")}
- Feeding method: ${patient.feedingMethod}
- Allergies: ${patient.allergies.join(", ") || "None"}
- Intolerances: ${patient.intolerances.join(", ") || "None"}
- Daily budget: ₱${Math.round(patient.monthlyBudgetPhp / 30)}

Return a JSON object with a single key "substitutes" whose value is an array of objects.
  Each object must have: "name", "description", "estimatedCost" (number in PHP), "nutrients" (string — key nutrients this food provides), "reason" (why this is suitable).

Example: {"substitutes": [{"name": "Tofu", "description": "High-protein soy product", "estimatedCost": 15, "nutrients": "Protein, calcium, iron", "reason": "Suitable for diabetes management"}]}

Return ONLY valid JSON. No markdown, no code fences.`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY not configured." }, { status: 500 });

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a Filipino clinical nutritionist. Always respond with valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `AI error: ${text}` }, { status: 502 });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return NextResponse.json({ error: "AI returned empty response." }, { status: 502 });

  const parsed = JSON.parse(content);
  return NextResponse.json({ substitutes: parsed.substitutes ?? [] });
}
