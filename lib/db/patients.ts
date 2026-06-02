import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema/schema";
import { type CreatePatientInput, type Patient } from "@/types/domain";

function toPatient(row: typeof patients.$inferSelect): Patient {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    age: row.age,
    heightCm: row.heightCm ? Number(row.heightCm) : null,
    weightKg: row.weightKg ? Number(row.weightKg) : null,
    diagnoses: row.diagnoses,
    feedingMethod: row.feedingMethod,
    allergies: row.allergies,
    intolerances: row.intolerances,
    monthlyBudgetPhp: Number(row.monthlyBudgetPhp),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createPatient(userId: string, input: CreatePatientInput) {
  const [row] = await db
    .insert(patients)
    .values({
      userId,
      name: input.name,
      age: input.age,
      heightCm: input.heightCm?.toString() ?? null,
      weightKg: input.weightKg?.toString() ?? null,
      diagnoses: input.diagnoses,
      feedingMethod: input.feedingMethod,
      allergies: input.allergies ?? [],
      intolerances: input.intolerances ?? [],
      monthlyBudgetPhp: input.monthlyBudgetPhp.toString(),
    })
    .returning();

  return toPatient(row);
}

export async function listRecentPatientsByUser(userId: string, limit = 5) {
  const rows = await db
    .select({
      id: patients.id,
      name: patients.name,
      updatedAt: patients.updatedAt,
    })
    .from(patients)
    .where(eq(patients.userId, userId))
    .orderBy(patients.updatedAt)
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function listPatientsByUser(userId: string) {
  const rows = await db
    .select()
    .from(patients)
    .where(eq(patients.userId, userId))
    .orderBy(patients.createdAt);

  return rows.map(toPatient);
}

export async function getPatientById(userId: string, patientId: string) {
  const [row] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.userId, userId)))
    .limit(1);

  return row ? toPatient(row) : null;
}

export async function updatePatient(
  userId: string,
  patientId: string,
  input: CreatePatientInput,
) {
  const [row] = await db
    .update(patients)
    .set({
      name: input.name,
      age: input.age,
      heightCm: input.heightCm?.toString() ?? null,
      weightKg: input.weightKg?.toString() ?? null,
      diagnoses: input.diagnoses,
      feedingMethod: input.feedingMethod,
      allergies: input.allergies ?? [],
      intolerances: input.intolerances ?? [],
      monthlyBudgetPhp: input.monthlyBudgetPhp.toString(),
      updatedAt: new Date(),
    })
    .where(and(eq(patients.id, patientId), eq(patients.userId, userId)))
    .returning();

  return row ? toPatient(row) : null;
}

export async function deletePatient(userId: string, patientId: string) {
  const [row] = await db
    .delete(patients)
    .where(and(eq(patients.id, patientId), eq(patients.userId, userId)))
    .returning({ id: patients.id });

  return !!row;
}
