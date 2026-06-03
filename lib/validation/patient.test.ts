import { describe, it, expect } from "vitest";
import { patientSchema, patientFormSchema } from "./patient";

const validPatient = {
  name: "Juan Dela Cruz",
  age: 65,
  heightCm: 165,
  weightKg: 72.5,
  diagnoses: ["diabetes", "hypertension"],
  feedingMethod: "oral" as const,
  allergies: [],
  intolerances: ["lactose"],
  monthlyBudgetPhp: 5000,
};

const validFormPatient = {
  name: "Juan Dela Cruz",
  age: "65",
  heightCm: "165",
  weightKg: "72.5",
  diagnoses: ["diabetes"],
  feedingMethod: "oral" as const,
  allergies: "",
  intolerances: "lactose",
  monthlyBudgetPhp: "5000",
};

describe("patientSchema", () => {
  it("accepts valid patient", () => {
    const result = patientSchema.safeParse(validPatient);
    expect(result.success).toBe(true);
  });

  it("accepts nullable height and weight", () => {
    const result = patientSchema.safeParse({ ...validPatient, heightCm: null, weightKg: null });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = patientSchema.safeParse({ ...validPatient, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects age below 1", () => {
    const result = patientSchema.safeParse({ ...validPatient, age: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects age above 120", () => {
    const result = patientSchema.safeParse({ ...validPatient, age: 121 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer age", () => {
    const result = patientSchema.safeParse({ ...validPatient, age: 25.5 });
    expect(result.success).toBe(false);
  });

  it("rejects empty diagnoses", () => {
    const result = patientSchema.safeParse({ ...validPatient, diagnoses: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid feeding method", () => {
    const result = patientSchema.safeParse({ ...validPatient, feedingMethod: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects budget below 500", () => {
    const result = patientSchema.safeParse({ ...validPatient, monthlyBudgetPhp: 499 });
    expect(result.success).toBe(false);
  });

  it("accepts budget of exactly 500", () => {
    const result = patientSchema.safeParse({ ...validPatient, monthlyBudgetPhp: 500 });
    expect(result.success).toBe(true);
  });

  it("accepts height and weight at boundary values", () => {
    const result = patientSchema.safeParse({
      ...validPatient,
      heightCm: 250,
      weightKg: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects height below 50", () => {
    const result = patientSchema.safeParse({ ...validPatient, heightCm: 49 });
    expect(result.success).toBe(false);
  });

  it("rejects height above 250", () => {
    const result = patientSchema.safeParse({ ...validPatient, heightCm: 251 });
    expect(result.success).toBe(false);
  });
});

describe("patientFormSchema", () => {
  it("accepts valid form input", () => {
    const result = patientFormSchema.safeParse(validFormPatient);
    expect(result.success).toBe(true);
  });

  it("rejects non-numeric age string", () => {
    const result = patientFormSchema.safeParse({ ...validFormPatient, age: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects age out of range", () => {
    const result = patientFormSchema.safeParse({ ...validFormPatient, age: "121" });
    expect(result.success).toBe(false);
  });

  it("accepts optional empty height", () => {
    const result = patientFormSchema.safeParse({ ...validFormPatient, heightCm: "" });
    expect(result.success).toBe(true);
  });

  it("rejects height out of range", () => {
    const result = patientFormSchema.safeParse({ ...validFormPatient, heightCm: "300" });
    expect(result.success).toBe(false);
  });

  it("rejects budget below 500", () => {
    const result = patientFormSchema.safeParse({ ...validFormPatient, monthlyBudgetPhp: "499" });
    expect(result.success).toBe(false);
  });

  it("accepts budget of exactly 500", () => {
    const result = patientFormSchema.safeParse({ ...validFormPatient, monthlyBudgetPhp: "500" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = patientFormSchema.safeParse({ ...validFormPatient, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty diagnoses", () => {
    const result = patientFormSchema.safeParse({ ...validFormPatient, diagnoses: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid feeding method", () => {
    const result = patientFormSchema.safeParse({ ...validFormPatient, feedingMethod: "invalid" });
    expect(result.success).toBe(false);
  });
});
