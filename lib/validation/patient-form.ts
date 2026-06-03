import { z } from "zod";
import { FEEDING_METHODS } from "@/types/domain";

export const patientFormSchema = z.object({
  name: z.string().min(1, "Patient name is required."),
  age: z.string().refine((v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 120;
  }, "Age must be a whole number between 1 and 120."),
  heightCm: z
    .string()
    .optional()
    .refine(
      (v) => !v || (Number(v) >= 50 && Number(v) <= 250),
      "Height must be between 50 and 250 cm.",
    ),
  weightKg: z.string().optional(),
  diagnoses: z.array(z.string()).min(1, "At least one diagnosis is required."),
  feedingMethod: z.enum(FEEDING_METHODS),
  allergies: z.string().optional(),
  intolerances: z.string().optional(),
  monthlyBudgetPhp: z
    .string()
    .refine(
      (v) => Number(v) >= 500,
      "Monthly budget must be at least 500 PHP.",
    ),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
