export const DIAGNOSIS_OPTIONS = [
  "stroke",
  "diabetes",
  "ckd",
  "hypertension",
  "high-cholesterol",
] as const;

export type Diagnosis = (typeof DIAGNOSIS_OPTIONS)[number];

export const FEEDING_METHOD_OPTIONS = [
  "oral",
  "ngt-soft",
  "ngt-pureed",
] as const;
