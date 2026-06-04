import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { medications } from "@/lib/db/schema/schema";
import type { Medication } from "@/types/domain";

function toMedication(row: typeof medications.$inferSelect): Medication {
  return {
    id: row.id,
    patientId: row.patientId,
    name: row.name,
    dosage: row.dosage,
    frequency: row.frequency,
    route: row.route,
    times: row.times,
    startDate: row.startDate,
    endDate: row.endDate,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createMedication(
  patientId: string,
  data: {
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    times?: string[];
    startDate: string;
    endDate?: string;
    notes?: string;
  },
) {
  const [row] = await db
    .insert(medications)
    .values({ patientId, ...data, endDate: data.endDate ?? null, notes: data.notes ?? null, times: data.times ?? [] })
    .returning();
  return toMedication(row);
}

export async function listMedicationsByPatient(patientId: string) {
  const rows = await db
    .select()
    .from(medications)
    .where(eq(medications.patientId, patientId))
    .orderBy(desc(medications.createdAt));
  return rows.map(toMedication);
}

export async function updateMedication(
  medId: string,
  data: {
    name?: string;
    dosage?: string;
    frequency?: string;
    route?: string;
    times?: string[];
    startDate?: string;
    endDate?: string | null;
    notes?: string | null;
  },
) {
  const [row] = await db
    .update(medications)
    .set(data)
    .where(eq(medications.id, medId))
    .returning();
  return row ? toMedication(row) : null;
}

export async function deleteMedication(patientId: string, medId: string) {
  const [row] = await db
    .delete(medications)
    .where(and(eq(medications.id, medId), eq(medications.patientId, patientId)))
    .returning({ id: medications.id });
  return !!row;
}
