import { describe, it, expect } from "vitest";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/prompt-builder";
import type { PatientContext } from "@/lib/db/patients/context";

const baseContext: PatientContext = {
  patient: {
    id: "p1",
    userId: "u1",
    name: "Juan Dela Cruz",
    age: 65,
    heightCm: 165,
    weightKg: 72.5,
    diagnoses: ["diabetes", "hypertension"],
    feedingMethod: "oral",
    allergies: [],
    intolerances: ["lactose"],
    monthlyBudgetPhp: 5000,
    createdAt: "2026-01-01",
    updatedAt: "2026-06-01",
  },
  activeMedications: [],
  recentVisitNotes: [],
  monthlyExpenses: null,
  mealPlan: null,
  allAbnormalValues: [],
  latestDocument: null,
};

describe("buildChatSystemPrompt", () => {
  it("includes patient name and age", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).toContain("Juan Dela Cruz");
    expect(result).toContain("65-year-old");
  });

  it("includes diagnoses", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).toContain("diabetes, hypertension");
  });

  it("reports none when no allergies", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).toContain("Allergies: None");
  });

  it("includes intolerances", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).toContain("Intolerances: lactose");
  });

  it("includes formatted budget", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).toContain("₱5,000");
  });

  it("includes feeding method", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).toContain("oral");
  });

  it("includes BMI", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).toContain(String(72.5 / (165 / 100) ** 2));
  });

  it("omits weight and height when not provided", () => {
    const ctx = {
      ...baseContext,
      patient: { ...baseContext.patient, heightCm: null, weightKg: null },
    };
    const result = buildChatSystemPrompt(ctx);
    expect(result).toContain("Not provided");
    expect(result).toContain("Not specified");
  });

  it("includes active medications", () => {
    const ctx = {
      ...baseContext,
      activeMedications: [
        { name: "Metformin", dosage: "500mg", frequency: "twice daily", route: "oral" },
      ],
    };
    const result = buildChatSystemPrompt(ctx);
    expect(result).toContain("Current Medications:");
    expect(result).toContain("Metformin 500mg");
  });

  it("includes recent visit notes (limited to 5)", () => {
    const ctx = {
      ...baseContext,
      recentVisitNotes: [
        { date: "2026-05-01", type: "checkup", notes: "BP normal" },
        { date: "2026-05-15", type: "follow-up", notes: "Adjust meds" },
      ],
    };
    const result = buildChatSystemPrompt(ctx);
    expect(result).toContain("Recent Visit Notes:");
    expect(result).toContain("2026-05-01 (checkup): BP normal");
    expect(result).toContain("2026-05-15 (follow-up): Adjust meds");
  });

  it("includes monthly expenses", () => {
    const ctx = {
      ...baseContext,
      monthlyExpenses: { totalSpent: 1200, budget: 5000, percent: 24, count: 8 },
    };
    const result = buildChatSystemPrompt(ctx);
    expect(result).toContain("₱1,200 spent");
    expect(result).toContain("24%");
    expect(result).toContain("8 transactions");
  });

  it("includes meal plan info", () => {
    const ctx = {
      ...baseContext,
      mealPlan: {
        weekStart: "2026-06-01",
        foodNames: ["Oatmeal", "Grilled Fish"],
        dailyCost: 202,
      },
    };
    const result = buildChatSystemPrompt(ctx);
    expect(result).toContain("Oatmeal, Grilled Fish");
    expect(result).toContain("₱202/day");
  });

  it("includes abnormal lab values", () => {
    const ctx = {
      ...baseContext,
      allAbnormalValues: [
        {
          fileName: "lab-march.png",
          values: [
            {
              name: "Glucose",
              value: "180",
              unit: "mg/dL",
              referenceRange: "70-100",
              interpretation: "Elevated",
            },
          ],
        },
      ],
    };
    const result = buildChatSystemPrompt(ctx);
    expect(result).toContain("lab-march.png");
    expect(result).toContain("Glucose: 180 mg/dL");
  });

  it("includes latest document analysis", () => {
    const ctx = {
      ...baseContext,
      latestDocument: {
        fileName: "lab-april.png",
        summary: "Good improvement",
        findings: "Glucose down to 120",
        concerns: ["Still slightly elevated"],
        relevantDiagnoses: ["Diabetes Type 2"],
        dietaryConsiderations: "Continue low-GI diet",
        extractedValues: [],
      },
    };
    const result = buildChatSystemPrompt(ctx);
    expect(result).toContain("lab-april.png");
    expect(result).toContain("Good improvement");
    expect(result).toContain("Diabetes Type 2");
  });

  it("ends with the system instruction footer", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).toContain("Answer questions about Juan Dela Cruz's care");
    expect(result).toContain("2 to 3 sentences maximum");
  });

  it("omits medications section when none", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).not.toContain("Current Medications:");
  });

  it("omits visit notes section when none", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).not.toContain("Recent Visit Notes:");
  });

  it("omits expenses section header when null", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).not.toContain("spent of");
  });

  it("omits meal plan section when null", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).not.toContain("Current Meal Plan");
  });

  it("omits abnormal values section when empty", () => {
    const result = buildChatSystemPrompt(baseContext);
    expect(result).not.toContain("All Lab Results");
  });
});
