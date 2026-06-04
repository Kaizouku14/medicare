import { and, desc, eq, isNotNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { patientDocuments } from "@/lib/db/schema/schema";
import {
  type DocumentAnalysis,
  type PatientDocument,
} from "@/types/domain";
import { storeEmbeddingFireAndForget } from "@/lib/ai/embeddings/store";

function toPatientDocument(
  row: typeof patientDocuments.$inferSelect,
): PatientDocument {
  return {
    id: row.id,
    patientId: row.patientId,
    fileName: row.fileName,
    fileType: row.fileType,
    storagePath: row.storagePath,
    analysis: row.analysis as DocumentAnalysis | null,
    analyzedAt: row.analyzedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createDocument(
  patientId: string,
  fileName: string,
  fileType: string,
  storagePath: string,
) {
  const [row] = await db
    .insert(patientDocuments)
    .values({
      patientId,
      fileName,
      fileType,
      storagePath,
    })
    .returning();

  return toPatientDocument(row);
}

export async function updateDocumentAnalysis(
  documentId: string,
  analysis: DocumentAnalysis,
) {
  const [row] = await db
    .update(patientDocuments)
    .set({
      analysis,
      analyzedAt: new Date(),
    })
    .where(eq(patientDocuments.id, documentId))
    .returning();

  if (row) {
    const content = `${row.fileName}. Summary: ${analysis.summary}. Findings: ${analysis.findings}`;
    storeEmbeddingFireAndForget(row.patientId, "document_analysis", row.id, content);
  }

  return row ? toPatientDocument(row) : null;
}

export async function listDocumentsByPatient(patientId: string) {
  const rows = await db
    .select()
    .from(patientDocuments)
    .where(eq(patientDocuments.patientId, patientId))
    .orderBy(desc(patientDocuments.createdAt));

  return rows.map(toPatientDocument);
}

export async function getDocumentById(
  patientId: string,
  documentId: string,
) {
  const [row] = await db
    .select()
    .from(patientDocuments)
    .where(
      and(
        eq(patientDocuments.id, documentId),
        eq(patientDocuments.patientId, patientId),
      ),
    )
    .limit(1);

  return row ? toPatientDocument(row) : null;
}

export async function deleteDocument(
  patientId: string,
  documentId: string,
) {
  const [row] = await db
    .delete(patientDocuments)
    .where(
      and(
        eq(patientDocuments.id, documentId),
        eq(patientDocuments.patientId, patientId),
      ),
    )
    .returning({ id: patientDocuments.id, storagePath: patientDocuments.storagePath });

  return row ?? null;
}

export async function getLatestAnalyzedDocument(patientId: string) {
  const [row] = await db
    .select()
    .from(patientDocuments)
    .where(
      and(
        eq(patientDocuments.patientId, patientId),
        isNotNull(patientDocuments.analyzedAt),
      ),
    )
    .orderBy(desc(patientDocuments.analyzedAt))
    .limit(1);

  return row ? toPatientDocument(row) : null;
}
