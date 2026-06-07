import { type Patient, type DocumentAnalysis } from "@/types/domain";
import { getPatientById } from "@/lib/db/patients";
import { getLatestMealPlan } from "@/lib/db/meal-plans";
import { listDocumentsByPatient } from "@/lib/db/patients/documents";
import { listMedicationsByPatient } from "@/lib/db/tracking/medications";
import { listVisitNotesByPatient } from "@/lib/db/tracking/visit-notes";
import { listExpensesByPatient } from "@/lib/db/tracking/expenses";

export type MedicationBrief = {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
};

export type AbnormalValue = {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
};

export type DocAbnormal = {
  fileName: string;
  values: AbnormalValue[];
};

export type PatientContext = {
  patient: Patient;
  activeMedications: MedicationBrief[];
  recentVisitNotes: { date: string; type: string; notes: string }[];
  monthlyExpenses: { totalSpent: number; budget: number; percent: number; count: number } | null;
  mealPlan: { weekStart: string; foodNames: string[]; dailyCost: number | null } | null;
  allAbnormalValues: DocAbnormal[];
  latestDocument: {
    fileName: string;
    summary: string;
    findings: string;
    concerns: string[];
    relevantDiagnoses: string[];
    dietaryConsiderations: string;
    extractedValues: DocumentAnalysis["extractedValues"];
  } | null;
};

async function listMonthExpenses(patientId: string, budget: number) {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, "0")}`;

  const expenses = await listExpensesByPatient(patientId, monthStart, monthEnd);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const percent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  return { totalSpent, budget, percent, count: expenses.length };
}

export async function buildPatientContext(
  userId: string,
  patientId: string,
): Promise<PatientContext> {
  const patient = await getPatientById(userId, patientId);
  if (!patient) {
    throw new Error("Patient not found.");
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

  const activeMedications = allMeds
    .flatMap((m) => {
      if (m.endDate && new Date(m.endDate) < new Date()) return [];
      return [{
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        route: m.route,
      }];
    });

  const analyzedDocs = allDocuments.filter((d) => d.analysis);

  const allAbnormalValues: DocAbnormal[] = analyzedDocs
    .flatMap((doc) => {
      const abnormal = (doc.analysis?.extractedValues ?? []).filter(
        (v) => v.isAbnormal,
      );
      return abnormal.length > 0
        ? [{ fileName: doc.fileName, values: abnormal.map((v) => ({ name: v.name, value: v.value, unit: v.unit, referenceRange: v.referenceRange, interpretation: v.interpretation })) }]
        : [];
    });

  const latestDoc = analyzedDocs.length > 0
    ? analyzedDocs[analyzedDocs.length - 1]
    : null;

  const latestDocument = latestDoc?.analysis
    ? {
        fileName: latestDoc.fileName,
        summary: latestDoc.analysis.summary,
        findings: latestDoc.analysis.findings,
        concerns: latestDoc.analysis.concerns,
        relevantDiagnoses: latestDoc.analysis.relevantDiagnoses,
        dietaryConsiderations: latestDoc.analysis.dietaryConsiderations,
        extractedValues: latestDoc.analysis.extractedValues,
      }
    : null;

  return {
    patient,
    activeMedications,
    recentVisitNotes: visitNotes.map((v) => ({
      date: v.date,
      type: v.type,
      notes: v.notes,
    })),
    monthlyExpenses: monthExpenses,
    mealPlan: mealPlan
      ? {
          weekStart: mealPlan.weekStart,
          foodNames: mealPlan.recommendations.map((r) => r.name),
          dailyCost: mealPlan.averageDailyCost,
        }
      : null,
    allAbnormalValues,
    latestDocument,
  };
}
