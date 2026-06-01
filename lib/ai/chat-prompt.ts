import { getPatientById } from "@/lib/db/patients";
import { getLatestMealPlan } from "@/lib/db/meal-plans";
import { listDocumentsByPatient } from "@/lib/db/patient-documents";

export async function buildSystemPrompt(
  userId: string,
  patientId: string | null,
): Promise<string> {
  if (!patientId) {
    return `You are MediCare AI, a compassionate medical and nutrition assistant for Filipino caregivers. You help users understand medical conditions, medications, and caregiving best practices. Always prioritize safety — if a question requires professional medical advice, say so. Be warm, clear, and practical. Use everyday Filipino-English (Taglish) when appropriate. Keep responses very concise — 2 to 3 sentences maximum.`;
  }

  const patient = await getPatientById(userId, patientId);
  if (!patient) {
    return `You are MediCare AI... (patient not found — use general knowledge)`;
  }

  const mealPlan = await getLatestMealPlan(patientId);
  const documents = await listDocumentsByPatient(patientId);

  let prompt = `You are MediCare AI, a medical nutrition assistant helping care for ${patient.name}, a ${patient.age}-year-old Filipino patient.

Patient Profile:
- Age: ${patient.age}
- Weight: ${patient.weightKg ? `${patient.weightKg} kg` : "Not provided"}
- Diagnoses: ${patient.diagnoses.join(", ")}
- Feeding method: ${patient.feedingMethod.replace("-", " ")}
- Allergies: ${patient.allergies.length > 0 ? patient.allergies.join(", ") : "None"}
- Intolerances: ${patient.intolerances.length > 0 ? patient.intolerances.join(", ") : "None"}
- Monthly budget: ₱${Number(patient.monthlyBudgetPhp).toLocaleString()}`;

  if (mealPlan) {
    prompt += `\n\nCurrent Meal Plan (started ${mealPlan.weekStart}):
Recommended foods: ${mealPlan.recommendations.map((r) => r.name).join(", ")}

Daily budget target: ${mealPlan.totalDailyCost ? `₱${Number(mealPlan.totalDailyCost).toLocaleString()}/day` : "Not set"}`;
  }

  const analyzedDocs = documents.filter((d) => d.analysis);
  if (analyzedDocs.length > 0) {
    const latest = analyzedDocs[analyzedDocs.length - 1];
    if (latest.analysis) {
      prompt += `\n\nLatest Lab Results (${latest.fileName}):
Summary: ${latest.analysis.summary}
Findings: ${latest.analysis.findings}
Concerns: ${latest.analysis.concerns.join("; ")}

Relevant diagnoses from results: ${latest.analysis.relevantDiagnoses.join(", ")}
Dietary considerations: ${latest.analysis.dietaryConsiderations}`;

      const abnormal = latest.analysis.extractedValues.filter((v) => v.isAbnormal);
      if (abnormal.length > 0) {
        prompt += `\nAbnormal Values:`;
        for (const v of abnormal) {
          prompt += `\n- ${v.name}: ${v.value} ${v.unit} (ref: ${v.referenceRange}) — ${v.interpretation}`;
        }
      }
    }
  }

  prompt += `\n\nAnswer questions about ${patient.name}'s care, diet, feeding, and budget. Use Taglish when helpful. Always be compassionate and practical. If a question needs a doctor's input, say so clearly. Keep responses very concise — 2 to 3 sentences maximum.`;

  return prompt;
}
