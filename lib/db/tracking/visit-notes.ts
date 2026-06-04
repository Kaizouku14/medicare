import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { visitNotes } from "@/lib/db/schema/schema";
import type { VisitNote } from "@/types/domain";
import { storeEmbeddingFireAndForget } from "@/lib/ai/embeddings/store";

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

  storeEmbeddingFireAndForget(patientId, "visit_note", row.id, data.notes);

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

export async function updateVisitNote(
  noteId: string,
  data: { date?: string; type?: string; notes?: string },
) {
  const [row] = await db
    .update(visitNotes)
    .set(data)
    .where(eq(visitNotes.id, noteId))
    .returning();

  if (row && data.notes) {
    storeEmbeddingFireAndForget(row.patientId, "visit_note", row.id, data.notes);
  }

  return row ? toVisitNote(row) : null;
}

export async function deleteVisitNote(patientId: string, noteId: string) {
  const [row] = await db
    .delete(visitNotes)
    .where(and(eq(visitNotes.id, noteId), eq(visitNotes.patientId, patientId)))
    .returning({ id: visitNotes.id });
  return !!row;
}
