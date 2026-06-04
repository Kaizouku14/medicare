import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/ai/embeddings/groq-embed";

export type SearchResult = {
  id: string;
  sourceType: "visit_note" | "document_analysis" | "chat_history";
  content: string;
  refDate: string;
  relevance: number;
};

type SearchRow = {
  id: string;
  source_type: string;
  content: string;
  ref_date: string;
  relevance: number;
};

function parseSourceType(raw: string): SearchResult["sourceType"] {
  if (raw === "visit_note" || raw === "document_analysis" || raw === "chat_history") {
    return raw;
  }
  return "visit_note";
}

function deduplicate(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    const hash = r.content.slice(0, 100);
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
}

function truncateContent(content: string): string {
  return content.length > 500 ? content.slice(0, 500) + "..." : content;
}

export async function searchPatientContext(
  patientId: string,
  query: string,
  limit = 5,
  minRelevance = 0.2,
): Promise<SearchResult[]> {
  if (!query || query.length < 3) return [];

  try {
    const embedding = await generateEmbedding(query);
    if (!embedding) return [];

    const embeddingStr = `[${embedding.join(",")}]`;

    const result = await db.execute<SearchRow>(
      sql`
        SELECT
          id,
          source_type,
          content,
          ref_date,
          1 - (embedding <=> ${sql.raw(embeddingStr)}::vector) AS relevance
        FROM patient_embeddings
        WHERE
          patient_id = ${patientId}::uuid
          AND embedding IS NOT NULL
        ORDER BY embedding <=> ${sql.raw(embeddingStr)}::vector
        LIMIT ${limit}
      `,
    );

    const rows = result as unknown as SearchRow[];

    const results: SearchResult[] = rows.reduce<SearchResult[]>((acc, r) => {
      if (r.relevance >= minRelevance) {
        acc.push({
          id: r.id,
          sourceType: parseSourceType(r.source_type),
          content: truncateContent(r.content),
          refDate: r.ref_date,
          relevance: r.relevance,
        });
      }
      return acc;
    }, []);

    return deduplicate(results);
  } catch {
    return [];
  }
}
