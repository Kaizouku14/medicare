import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { storeEmbedding } from "@/lib/ai/embeddings/store";

async function getRecordsWithoutEmbeddings(
  sourceType: string,
  table: string,
  idColumn: string,
  patientIdColumn: string,
  contentColumn: string,
) {
  const result = await db.execute(
    sql`
      SELECT ${sql.raw(idColumn)}::text AS id,
             ${sql.raw(patientIdColumn)} AS patient_id,
             ${sql.raw(contentColumn)} AS content
      FROM ${sql.raw(table)}
      WHERE ${sql.raw(idColumn)}::text NOT IN (
        SELECT source_id FROM patient_embeddings WHERE source_type = ${sourceType}
      )
      LIMIT 100
    `,
  );
  return (result as unknown as Array<{ id: string; patient_id: string; content: string }>) ?? [];
}

export async function backfillAllEmbeddings() {
  console.log("Backfilling embeddings for visit notes...");
  const notes = await getRecordsWithoutEmbeddings(
    "visit_note", "visit_notes", "id", "patient_id", "notes",
  );
  for (const n of notes) {
    await storeEmbedding(n.patient_id, "visit_note", n.id, n.content);
    console.log(`  visit_note ${n.id}`);
  }

  console.log("Backfilling embeddings for document analyses...");
  const docs = await getRecordsWithoutEmbeddings(
    "document_analysis", "patient_documents", "id", "patient_id",
    "file_name || '. Summary: ' || COALESCE(analysis->>'summary', '') || '. Findings: ' || COALESCE(analysis->>'findings', '')",
  );
  for (const d of docs) {
    await storeEmbedding(d.patient_id, "document_analysis", d.id, d.content);
    console.log(`  document_analysis ${d.id}`);
  }

  console.log("Backfilling embeddings for chat messages...");
  const result = await db.execute(
    sql`
      SELECT cm.id::text AS id, s.patient_id, cm.content
      FROM chat_messages cm
      JOIN chat_sessions s ON s.id = cm.session_id
      WHERE s.patient_id IS NOT NULL
        AND cm.id::text NOT IN (
          SELECT source_id FROM patient_embeddings WHERE source_type = 'chat_message'
        )
      LIMIT 100
    `,
  );
  const chats = (result as unknown as Array<{ id: string; patient_id: string; content: string }>) ?? [];
  for (const c of chats) {
    await storeEmbedding(c.patient_id, "chat_message", c.id, c.content);
    console.log(`  chat_message ${c.id}`);
  }

  console.log("Backfill complete.");
}

// Run directly: npx tsx lib/scripts/backfill-embeddings.ts
backfillAllEmbeddings().catch(console.error);
