# RAG Phase 2 — Vector Search with pgvector

**Date:** 2026-06-04
**Status:** Draft
**Prerequisite:** Phase 1 (full-text search) deployed

---

## 1. Problem

Phase 1 keyword search misses semantically similar content — "sodium levels" won't match "hyponatremia" or "serum Na+". This limits the chat AI's ability to answer patient-specific questions that use different terminology than the source documents.

## 2. Goal

Enable semantic search across patient data by generating embeddings for all text sources and querying via cosine similarity, then merging results with keyword search for maximum recall.

## 3. Approach

### 3.1 Storage — Separate Embeddings Table

Create a dedicated table rather than adding columns to existing tables:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE patient_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('visit_note', 'document_analysis', 'chat_message')),
  source_id text NOT NULL,
  content text NOT NULL,
  embedding vector(768),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_patient_embeddings_vector
ON patient_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX idx_patient_embeddings_patient
ON patient_embeddings (patient_id);
```

Vector dimension: **768** — Groq's `nomic-embed-text-v1.5` embedding model output.

> **Note:** If Groq's embeddings endpoint is unavailable in your plan, the fallback is OpenAI's `text-embedding-3-small` (512 dimensions) — requires an `OPENAI_API_KEY` in `.env`. The vector index dimension can be adjusted per provider.

Rationale for separate table:
- No schema changes to 3 existing tables
- Single query for vector search across all sources
- Embeddings can be regenerated independently of source data
- Reusable for future features (semantic search in document list, etc.)

### 3.2 Embedding Service

**File:** `lib/ai/embeddings/groq-embed.ts`

```typescript
async function generateEmbedding(text: string): Promise<number[]>
```

- Calls Groq's embeddings API endpoint
- Truncates input to 8k tokens (Groq limit)
- Returns 768-dimension vector
- Caches per content hash to avoid regeneration

### 3.3 When to Generate Embeddings

| Trigger | Source | Where |
|---|---|---|
| Visit note created/updated | Content | `visit-notes.ts` (after DB write) |
| Document analyzed | Summary + findings | `documents.ts` (after analysis saved) |
| Chat message saved | Message content | `chat.ts` (after message insert) |

All are fire-and-forget — failure to generate an embedding doesn't block the primary operation.

### 3.4 Hybrid Search

**File:** `lib/ai/retrieval/search-patient-context.ts`

Replace the current single search with a hybrid pipeline:

1. **Vector search** — generate embedding for query → cosine similarity against `patient_embeddings`
2. **Keyword search** — existing `plainto_tsquery` against `patient_search_index`
3. **Merge** — weighted score: 60% vector + 40% keyword
4. **Deduplicate** — by content hash
5. **Return** — top 5 results above 0.2 threshold

If Groq embeddings API fails → fall back to keyword-only (Phase 1 behavior).

### 3.5 Backfill Strategy

Existing records need embeddings. A `lib/scripts/backfill-embeddings.ts` script:
- Queries all visit notes, analyzed documents, and chat messages without embeddings
- Generates and stores them in batches of 10
- Run once after migration

## 4. Files Changed

| File | Change | Type |
|---|---|---|
| `lib/db/migrations/0008_pgvector.sql` | Enable vector, create table + indexes | New |
| `lib/ai/embeddings/groq-embed.ts` | Groq embeddings client | New |
| `lib/ai/retrieval/search-patient-context.ts` | Add vector search + hybrid merge | Modify |
| `lib/db/tracking/visit-notes.ts` | Generate embedding on create/update | Modify |
| `lib/db/patients/documents.ts` | Generate embedding on analysis save | Modify |
| `lib/db/chat.ts` | Generate embedding on message save | Modify |
| `lib/scripts/backfill-embeddings.ts` | Backfill existing records | New |

## 5. Error Handling

| Scenario | Behavior |
|---|---|
| Embedding API fails | Log warning, don't block primary operation |
| Vector search fails | Fall back to keyword-only |
| Query text > 8k tokens | Truncate before sending to embeddings API |
| Missing pgvector extension | Return 500 with clear error message |
| Backfill interrupted | Idempotent — safe to re-run |

## 6. Testing

1. **Unit** — `groq-embed.test.ts`: mock API, verify vector shape
2. **Unit** — `search-patient-context.test.ts`: mock both branches, verify hybrid merge
3. **Integration** — store embedding, search, verify result returned
4. **Regression** — Phase 1 keyword search still works if vector search fails
