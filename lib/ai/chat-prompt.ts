import { getPatientById } from "@/lib/db/patients";
import { getLatestMealPlan } from "@/lib/db/meal-plans";
import { listDocumentsByPatient } from "@/lib/db/patient-documents";
import { listMedicationsByPatient } from "@/lib/db/medications";
import { listVisitNotesByPatient } from "@/lib/db/visit-notes";
import { listExpensesByPatient } from "@/lib/db/expenses";

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

  const budget = patient.monthlyBudgetPhp;
  const [mealPlan, allDocuments, allMeds, visitNotes, monthExpenses] =
    await Promise.all([
      getLatestMealPlan(patientId),
      listDocumentsByPatient(patientId),
      listMedicationsByPatient(patientId),
      listVisitNotesByPatient(patientId),
      listMonthExpenses(patientId, budget),
    ]);

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

  const activeMeds = allMeds.filter(
    (m) => !m.endDate || new Date(m.endDate) >= new Date(),
  );
  if (activeMeds.length > 0) {
    prompt += `\n\nCurrent Medications:`;
    for (const m of activeMeds) {
      prompt += `\n- ${m.name} ${m.dosage} — ${m.frequency} — ${m.route}`;
    }
  }

  if (visitNotes.length > 0) {
    prompt += `\n\nRecent Visit Notes:`;
    for (const v of visitNotes.slice(0, 5)) {
      prompt += `\n- ${v.date} (${v.type}): ${v.notes}`;
    }
  }

  if (monthExpenses) {
    prompt += `\n\nBudget: ₱${monthExpenses.totalSpent.toLocaleString()} spent of ₱${monthExpenses.budget.toLocaleString()} budget (${monthExpenses.percent}%) — ${monthExpenses.count} transactions this month`;
  }

  if (mealPlan) {
    prompt += `\n\nCurrent Meal Plan (started ${mealPlan.weekStart}):
Recommended foods: ${mealPlan.recommendations.map((r) => r.name).join(", ")}

Daily budget target: ${mealPlan.totalDailyCost ? `₱${Number(mealPlan.totalDailyCost).toLocaleString()}/day` : "Not set"}`;
  }

  const analyzedDocs = allDocuments.filter((d) => d.analysis);
  if (analyzedDocs.length > 0) {
    const abnormalByDoc: { fileName: string; values: string[] }[] = [];
    for (const doc of analyzedDocs) {
      const abnormal = (doc.analysis?.extractedValues ?? []).filter(
        (v) => v.isAbnormal,
      );
      if (abnormal.length > 0) {
        abnormalByDoc.push({
          fileName: doc.fileName,
          values: abnormal.map(
            (v) =>
              `${v.name}: ${v.value} ${v.unit} (ref: ${v.referenceRange}) — ${v.interpretation}`,
          ),
        });
      }
    }

    if (abnormalByDoc.length > 0) {
      prompt += `\n\nAll Lab Results — Abnormal Values:`;
      for (const doc of abnormalByDoc) {
        prompt += `\n- ${doc.fileName}:`;
        for (const val of doc.values) {
          prompt += `\n  - ${val}`;
        }
      }
    }

    const latest = analyzedDocs[analyzedDocs.length - 1];
    if (latest.analysis) {
      prompt += `\n\nLatest Lab Results (${latest.fileName}):
Summary: ${latest.analysis.summary}
Findings: ${latest.analysis.findings}
Concerns: ${latest.analysis.concerns.join("; ")}

Relevant diagnoses from results: ${latest.analysis.relevantDiagnoses.join(", ")}
Dietary considerations: ${latest.analysis.dietaryConsiderations}`;
    }
  }

  prompt += `\n\nAnswer questions about ${patient.name}'s care, diet, feeding, medications, and budget. Use Taglish when helpful. Always be compassionate and practical. If a question needs a doctor's input, say so clearly. Keep responses very concise — 2 to 3 sentences maximum.`;

  return prompt;
}

async function listMonthExpenses(patientId: string, budget: number) {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, "0")}`;

  const expenses = await listExpensesByPatient(patientId, monthStart, monthEnd);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const percent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  return { totalSpent, budget, percent, count: expenses.length };
}
