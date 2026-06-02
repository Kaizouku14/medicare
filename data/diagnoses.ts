export const DIAGNOSIS_OPTIONS = [
  "stroke",
  "diabetes",
  "ckd",
  "hypertension",
  "high-cholesterol",
] as const;

export type Diagnosis = (typeof DIAGNOSIS_OPTIONS)[number];
