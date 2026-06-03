import { describe, it, expect } from "vitest";

// isDocumentAnalysis is not exported — replicate its logic here for testing
function isDocumentAnalysis(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.summary === "string" &&
    typeof obj.findings === "string" &&
    typeof obj.dietaryConsiderations === "string" &&
    Array.isArray(obj.concerns) &&
    Array.isArray(obj.extractedValues) &&
    (!obj.extractedValues.length ||
      (typeof obj.extractedValues[0]?.name === "string" &&
        typeof obj.extractedValues[0]?.value === "string"))
  );
}

const validAnalysis = {
  documentType: "lab-results" as const,
  summary: "Patient shows elevated glucose",
  findings: "Fasting glucose at 180 mg/dL",
  extractedValues: [
    { name: "Glucose", value: "180", unit: "mg/dL", referenceRange: "70-100", isAbnormal: true, interpretation: "Elevated" },
  ],
  concerns: ["Uncontrolled blood sugar"],
  relevantDiagnoses: ["Diabetes Type 2"],
  dietaryConsiderations: "Low glycemic index foods",
};

describe("isDocumentAnalysis", () => {
  it("accepts valid analysis", () => {
    expect(isDocumentAnalysis(validAnalysis)).toBe(true);
  });

  it("accepts valid analysis with empty extracted values", () => {
    expect(isDocumentAnalysis({ ...validAnalysis, extractedValues: [] })).toBe(true);
  });

  it("rejects null", () => {
    expect(isDocumentAnalysis(null)).toBe(false);
  });

  it("rejects non-object", () => {
    expect(isDocumentAnalysis("string")).toBe(false);
    expect(isDocumentAnalysis(42)).toBe(false);
    expect(isDocumentAnalysis(undefined)).toBe(false);
  });

  it("rejects missing summary", () => {
    const rest = { ...validAnalysis };
    delete rest.summary;
    expect(isDocumentAnalysis(rest)).toBe(false);
  });

  it("rejects missing findings", () => {
    const rest = { ...validAnalysis };
    delete rest.findings;
    expect(isDocumentAnalysis(rest)).toBe(false);
  });

  it("rejects missing dietaryConsiderations", () => {
    const rest = { ...validAnalysis };
    delete rest.dietaryConsiderations;
    expect(isDocumentAnalysis(rest)).toBe(false);
  });

  it("rejects non-array concerns", () => {
    expect(isDocumentAnalysis({ ...validAnalysis, concerns: "not-array" })).toBe(false);
  });

  it("rejects non-array extractedValues", () => {
    expect(isDocumentAnalysis({ ...validAnalysis, extractedValues: "not-array" })).toBe(false);
  });

  it("rejects extractedValues with invalid first item", () => {
    expect(
      isDocumentAnalysis({
        ...validAnalysis,
        extractedValues: [{ name: 123, value: "180" }],
      }),
    ).toBe(false);
  });

  it("accepts object with extra unknown keys", () => {
    expect(isDocumentAnalysis({ ...validAnalysis, extraField: "whatever" })).toBe(true);
  });
});
