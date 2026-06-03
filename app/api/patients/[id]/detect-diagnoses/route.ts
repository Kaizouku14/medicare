import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import { groqChat } from "@/lib/ai/groq-client";
import { updatePatientDiagnoses } from "@/lib/db/patients";
import type { DocumentAnalysis } from "@/types/domain";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const [{ user }, { id }] = await Promise.all([requireAuth(), params]);
    const patient = await requirePatientAccess(user.id, id);

    const body = (await req.json()) as { analysis: DocumentAnalysis };
    if (!body.analysis) {
      return NextResponse.json({ error: "analysis is required." }, { status: 400 });
    }

    const content = await groqChat(
      [
        {
          role: "system",
          content:
            "You are a clinical diagnosis expert. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: `Given the following document analysis and existing diagnoses, suggest additional medical diagnoses that should be added.

Existing diagnoses: ${patient.diagnoses.join(", ") || "None"}

Document analysis:
- Summary: ${body.analysis.summary}
- Findings: ${body.analysis.findings}
- Concerns: ${body.analysis.concerns.join(", ")}
- Extracted values: ${body.analysis.extractedValues.map((v) => `${v.name}: ${v.value} ${v.unit} (${v.isAbnormal ? "abnormal" : "normal"})`).join(", ")}

Return a JSON object with a single key "diagnoses" whose value is an array of strings (medical diagnosis names in lowercase with hyphens). Only include diagnoses that are clearly suggested by the document data. Do not include diagnoses already in the existing list.

Example: {"diagnoses": ["type-2-diabetes", "hypertension"]}

Return ONLY valid JSON. No markdown, no code fences.`,
        },
      ],
      "llama-3.3-70b-versatile",
      true,
    );

    const parsed = JSON.parse(content) as { diagnoses?: string[] };
    const newDiagnoses = parsed.diagnoses ?? [];

    if (newDiagnoses.length === 0) {
      return NextResponse.json({ diagnoses: [], message: "No new diagnoses detected." });
    }

    const merged = [...new Set([...patient.diagnoses, ...newDiagnoses])];
    const updated = await updatePatientDiagnoses(user.id, patient.id, merged);

    return NextResponse.json({
      diagnoses: newDiagnoses,
      allDiagnoses: merged,
      patient: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}