export type FeedingMethod = "oral" | "ngt-soft" | "ngt-pureed";

export type Patient = {
  id: string;
  userId: string;
  name: string;
  age: number;
  weightKg: number | null;
  diagnoses: string[];
  feedingMethod: FeedingMethod;
  allergies: string[];
  intolerances: string[];
  monthlyBudgetPhp: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePatientInput = {
  name: string;
  age: number;
  weightKg?: number | null;
  diagnoses: string[];
  feedingMethod: FeedingMethod;
  allergies?: string[];
  intolerances?: string[];
  monthlyBudgetPhp: number;
};
