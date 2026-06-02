export type FeedingMethod = "oral" | "ngt-soft" | "ngt-pureed";

export type Patient = {
  id: string;
  userId: string;
  name: string;
  age: number;
  heightCm: number | null;
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
  heightCm?: number | null;
  weightKg?: number | null;
  diagnoses: string[];
  feedingMethod: FeedingMethod;
  allergies?: string[];
  intolerances?: string[];
  monthlyBudgetPhp: number;
};

export type Nutrients = Record<string, string>;

export type FoodRecommendation = {
  name: string;
  description: string;
  estimatedCost: number;
  nutrients: string | Nutrients;
  reason: string;
};

export type MealRecipe = {
  ingredients: string[];
  instructions: string;
  prepTime: string;
};

export type DayMeal = {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string[];
  totalCost: number;
  recipes?: Record<string, MealRecipe>;
};

export type DocumentAnalysis = {
  documentType: "lab-results" | "ct-scan" | "ecg" | "other";
  summary: string;
  findings: string;
  extractedValues: Array<{
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
    interpretation: string;
  }>;
  concerns: string[];
  relevantDiagnoses: string[];
  dietaryConsiderations: string;
};

export type PatientDocument = {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string;
  storagePath: string;
  analysis: DocumentAnalysis | null;
  analyzedAt: string | null;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  userId: string;
  patientId: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Medication = {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
};

export type VisitNote = {
  id: string;
  patientId: string;
  date: string;
  type: "checkup" | "follow-up" | "emergency";
  notes: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  note: string | null;
  createdAt: string;
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
