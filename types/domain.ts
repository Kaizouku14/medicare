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

export type FoodRecommendation = {
  name: string;
  description: string;
  estimatedCost: number;
  nutrients: string;
  reason: string;
};

export type DayMeal = {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string[];
  totalCost: number;
};

export type MealPlan = {
  id: string;
  patientId: string;
  weekStart: string;
  recommendations: FoodRecommendation[];
  meals: DayMeal[];
  totalDailyCost: number | null;
  createdAt: string;
};
