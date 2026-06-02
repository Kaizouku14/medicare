import { type PatientContext } from "@/lib/db/patient-context";

export function buildChatSystemPrompt(context: PatientContext): string {
  const { patient } = context;

  let prompt = `You are MediCare AI, a medical nutrition assistant helping care for ${patient.name}, a ${patient.age}-year-old Filipino patient.

Patient Profile:
- Age: ${patient.age}
- Height: ${patient.heightCm ? `${patient.heightCm} cm` : "Not provided"}
- Weight: ${patient.weightKg ? `${patient.weightKg} kg` : "Not provided"}
- BMI: ${patient.heightCm && patient.weightKg ? `${patient.weightKg / (patient.heightCm / 100) ** 2}` : "Not specified"}
- Diagnoses: ${patient.diagnoses.join(", ")}
- Feeding method: ${patient.feedingMethod.replace("-", " ")}
- Allergies: ${patient.allergies.length > 0 ? patient.allergies.join(", ") : "None"}
- Intolerances: ${patient.intolerances.length > 0 ? patient.intolerances.join(", ") : "None"}
- Monthly budget: ₱${Number(patient.monthlyBudgetPhp).toLocaleString()}`;

  if (context.activeMedications.length > 0) {
    prompt += `\n\nCurrent Medications:`;
    for (const m of context.activeMedications) {
      prompt += `\n- ${m.name} ${m.dosage} — ${m.frequency} — ${m.route}`;
    }
  }

  if (context.recentVisitNotes.length > 0) {
    prompt += `\n\nRecent Visit Notes:`;
    for (const v of context.recentVisitNotes.slice(0, 5)) {
      prompt += `\n- ${v.date} (${v.type}): ${v.notes}`;
    }
  }

  if (context.monthlyExpenses) {
    prompt += `\n\nBudget: ₱${context.monthlyExpenses.totalSpent.toLocaleString()} spent of ₱${context.monthlyExpenses.budget.toLocaleString()} budget (${context.monthlyExpenses.percent}%) — ${context.monthlyExpenses.count} transactions this month`;
  }

  if (context.mealPlan) {
    prompt += `\n\nCurrent Meal Plan (started ${context.mealPlan.weekStart}):
Recommended foods: ${context.mealPlan.foodNames.join(", ")}

Daily budget target: ${context.mealPlan.dailyCost ? `₱${Number(context.mealPlan.dailyCost).toLocaleString()}/day` : "Not set"}`;
  }

  if (context.allAbnormalValues.length > 0) {
    prompt += `\n\nAll Lab Results — Abnormal Values:`;
    for (const doc of context.allAbnormalValues) {
      prompt += `\n- ${doc.fileName}:`;
      for (const val of doc.values) {
        prompt += `\n  - ${val.name}: ${val.value} ${val.unit} (ref: ${val.referenceRange}) — ${val.interpretation}`;
      }
    }
  }

  if (context.latestDocument) {
    prompt += `\n\nLatest Lab Results (${context.latestDocument.fileName}):
Summary: ${context.latestDocument.summary}
Findings: ${context.latestDocument.findings}
Concerns: ${context.latestDocument.concerns.join("; ")}

Relevant diagnoses from results: ${context.latestDocument.relevantDiagnoses.join(", ")}
Dietary considerations: ${context.latestDocument.dietaryConsiderations}`;
  }

  prompt += `\n\nAnswer questions about ${patient.name}'s care, diet, feeding, medications, and budget. Use Taglish when helpful. Always be compassionate and practical. If a question needs a doctor's input, say so clearly. Keep responses very concise — 2 to 3 sentences maximum.`;

  return prompt;
}
