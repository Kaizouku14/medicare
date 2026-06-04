import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generateEmbeddingSafe } from "@/lib/ai/embeddings/groq-embed";

export async function storeEmbedding(
  patientId: string,
  sourceType: "visit_note" | "document_analysis" | "chat_message",
  sourceId: string,
  content: string,
): Promise<void> {
  try {
    const embedding = await generateEmbeddingSafe(content);
    if (!embedding) return;

    const embeddingStr = `[${embedding.join(",")}]`;

    await db.execute(
      sql`
        INSERT INTO patient_embeddings (patient_id, source_type, source_id, content, embedding)
        VALUES (${patientId}::uuid, ${sourceType}, ${sourceId}, ${content}, ${sql.raw(embeddingStr)}::vector)
      `,
    );
  } catch {
    // Embedding generation is non-critical
  }
}

export function storeEmbeddingFireAndForget(
  patientId: string,
  sourceType: "visit_note" | "document_analysis" | "chat_message",
  sourceId: string,
  content: string,
): void {
  storeEmbedding(patientId, sourceType, sourceId, content).catch(() => {});
}
