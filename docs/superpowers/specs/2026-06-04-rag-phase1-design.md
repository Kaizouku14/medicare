# RAG Phase 1 — Supabase Full-Text Search for Patient Context

**Date:** 2026-06-04
**Status:** Draft
**Designer:** AI-assisted

---

## 1. Problem

The chat AI answers questions about a patient using only the patient profile and a limited context window (30 messages, 5 visit notes, latest document summary). It cannot retrieve specific information from older visit notes, past document analyses, or previous chat Q&A unless that data happens to be in the current context window.

## 2. Goal

Enable the chat AI to answer patient-specific questions by retrieving relevant text from the patient's visit notes, document analyses, and chat history — without adding a vector database or external embedding service.

## 3. Approach

**Phase 1 — Supabase Full-Text Search (this spec):**
- Create a SQL view that unions all patient data sources
- Build a search service that queries it with Postgres `ts_rank`
- Inject top results into the chat system prompt

Phase 2 (future) would upgrade to vector search with `pgvector`.

## 4. Data Sources

| Source | Table | Searchable Content | Notes |
|---|---|---|---|
| Visit notes | `visit_notes` | `notes` field | Includes date, type, full text |
| Document analyses | `patient_documents` | `file_name` + `analysis->>'summary'` + `analysis->>'findings'` | JSONB extracted to text |
| Chat history | `chat_messages` | `content` field (prefixed with Q: or A:) | Only sessions linked to this patient |

## 5. SQL View

```sql
CREATE VIEW patient_search_index AS
SELECT
  id || '-visit' AS id,
  patient_id,
  'visit_note' AS source_type,
  date AS ref_date,
  notes AS content,
  '' AS extra_meta
FROM visit_notes

UNION ALL

SELECT
  id || '-doc',
  patient_id,
  'document_analysis',
  created_at::text,
  file_name || '. Summary: ' || COALESCE(analysis->>'summary', '') || '. Findings: ' || COALESCE(analysis->>'findings', ''),
  COALESCE(analysis->>'documentType', '')
FROM patient_documents
WHERE analysis IS NOT NULL

UNION ALL

SELECT
  id || '-chat',
  s.patient_id,
  'chat_history',
  cm.created_at::text,
  CASE WHEN cm.role = 'user' THEN 'Q: ' ELSE 'A: ' END || cm.content,
  cm.role
FROM chat_messages cm
JOIN chat_sessions s ON s.id = cm.session_id
WHERE s.patient_id IS NOT NULL;
```

### Index

Add a GIN index on the content column for performance:

```sql
CREATE INDEX idx_patient_search_index_gin
ON patient_search_index
USING gin(to_tsvector('english', content));
```

## 6. Search Service

**File:** `lib/ai/retrieval/search-patient-context.ts`

### Interface

```typescript
type SearchResult = {
  id: string;
  sourceType: "visit_note" | "document_analysis" | "chat_history";
  content: string;
  refDate: string;
  relevance: number;
};

async function searchPatientContext(
  patientId: string,
  query: string,
  limit?: number,
  minRelevance?: number,
): Promise<SearchResult[]>
```

### Implementation

- Uses `db.execute()` with raw SQL
- Queries the `patient_search_index` view filtered by `patient_id`
- Uses `plainto_tsquery` for natural language query parsing
- Sorts by `ts_rank` descending
- Defaults: `limit = 5`, `minRelevance = 0.2`
- Results below `minRelevance` are filtered out

### Edge Cases

| Scenario | Behavior |
|---|---|
| No results | Returns empty array, no injection |
| Query too short (< 3 chars) | Skips search entirely |
| Search takes > 3s | `Promise.race` with timeout → falls back to empty |
| Duplicate content | Deduplicated by content hash |
| Result too long | Truncated to 500 chars |
| All results below threshold | Returns empty array, no injection |

## 7. Integration

### Changes to `lib/ai/prompts/chat-prompt.ts`

```typescript
export async function buildSystemPrompt(
  userId: string,
  patientId: string | null,
  userMessage?: string,
): Promise<string> {
  if (!patientId) return generalPrompt;

  const [context, searchResults] = await Promise.all([
    buildPatientContext(userId, patientId),
    userMessage
      ? searchPatientContext(patientId, userMessage)
      : Promise.resolve([]),
  ]);

  let prompt = buildChatSystemPrompt(context);

  if (searchResults.length > 0) {
    prompt += formatSearchResults(searchResults, context.patient.name);
  }

  return prompt;
}

function formatSearchResults(results: SearchResult[], patientName: string): string {
  const lines = results.map((r) => {
    const label = `[${formatSourceType(r.sourceType)} — ${r.refDate}]`;
    return `${label}: ${r.content}`;
  });
  return `\n\nRelevant records for ${patientName}:\n${lines.join("\n")}\n\nUse these records when answering the user's question.`;
}
```

### Changes to `app/api/chat/[sessionId]/route.ts`

Pass `userText` to `buildSystemPrompt`:

```typescript
const systemPrompt = await buildSystemPrompt(user.id, session.patientId, userText);
```

No changes needed to `app/api/chat/route.ts` — it calls `buildSystemPrompt` without `userText`, which is fine since the parameter is optional and global chat has no patient context to search.

## 8. Files Changed

| File | Change | Type |
|---|---|---|
| `lib/ai/retrieval/search-patient-context.ts` | New — search service | New |
| `lib/ai/prompts/chat-prompt.ts` | Add search call + injection | Modify |
| `app/api/chat/[sessionId]/route.ts` | Pass userText to buildSystemPrompt | Modify |
| SQL migration | Create view + GIN index | New migration |

## 9. Testing

1. **Unit test** — `search-patient-context.test.ts`
   - Mock DB response, verify results are filtered by threshold
   - Verify empty query returns empty
2. **Integration test** — with real DB
   - Insert visit note for patient, run search, verify it's found
   - Search with unrelated query, verify no results
3. **Prompt injection test**
   - Mock `searchPatientContext`, verify results appear in prompt
   - Mock empty results, verify prompt unchanged

## 10. Future Work (Phase 2)

- Upgrade to `pgvector` with embeddings
- Chunk documents for finer-grained retrieval
- Add weighted scoring (recent notes > old notes, document analysis > chat history)
- Add search over lab result values and medication names
