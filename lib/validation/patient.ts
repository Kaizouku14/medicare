import { z } from "zod";
import { FEEDING_METHODS } from "@/types/domain";

export const patientSchema = z.object({
  name: z.string().min(1, "Patient name is required."),
  age: z
    .number()
    .int("Age must be a whole number.")
    .min(1, "Age must be between 1 and 120.")
    .max(120, "Age must be between 1 and 120."),
  heightCm: z.number().min(50).max(250).nullable().optional(),
  weightKg: z.number().nullable().optional(),
  diagnoses: z.array(z.string()).min(1, "At least one diagnosis is required."),
  feedingMethod: z.enum(FEEDING_METHODS, {
    message: "Feeding method is invalid.",
  }),
  allergies: z.array(z.string()).optional(),
  intolerances: z.array(z.string()).optional(),
  monthlyBudgetPhp: z
    .number()
    .min(500, "Monthly budget must be at least 500 PHP."),
});

export type PatientSchemaInput = z.input<typeof patientSchema>;
