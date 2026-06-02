import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { visitNotes } from "@/lib/db/schema/schema";
import type { VisitNote } from "@/types/domain";

function toVisitNote(row: typeof visitNotes.$inferSelect): VisitNote {
  return {
    id: row.id,
    patientId: row.patientId,
    date: row.date,
    type: row.type as VisitNote["type"],
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createVisitNote(
  patientId: string,
  data: { date: string; type: string; notes: string },
) {
  const [row] = await db
    .insert(visitNotes)
    .values({ patientId, ...data })
    .returning();
  return toVisitNote(row);
}

export async function listVisitNotesByPatient(patientId: string) {
  const rows = await db
    .select()
    .from(visitNotes)
    .where(eq(visitNotes.patientId, patientId))
    .orderBy(desc(visitNotes.date));
  return rows.map(toVisitNote);
}

export async function deleteVisitNote(patientId: string, noteId: string) {
  const [row] = await db
    .delete(visitNotes)
    .where(and(eq(visitNotes.id, noteId), eq(visitNotes.patientId, patientId)))
    .returning({ id: visitNotes.id });
  return !!row;
}
