# Medical Document Analysis

**Date:** 2026-06-01
**Status:** Draft

## Overview

Allow caregivers to upload medical documents (lab results, CT scan reports, ECG
tracings) as images. A Groq vision model analyzes each document and returns
structured JSON — a plain-English summary, extracted lab values with reference
ranges, clinical concerns, and dietary implications. Extracted data feeds directly
into the existing meal plan AI prompt so recommendations adjust based on actual
lab numbers.

---

## Schema

New table `patient_documents` in `lib/db/schema/schema.ts`:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK, `defaultRandom()` | |
| `patient_id` | `uuid` FK → `patients.id` | `ON DELETE CASCADE` |
| `file_name` | `text` NOT NULL | Original filename |
| `file_type` | `text` NOT NULL | MIME type |
| `storage_path` | `text` NOT NULL | Path in Supabase Storage bucket |
| `analysis` | `jsonb` | Groq vision output |
| `analyzed_at` | `timestamp with tz` nullable | Null = pending analysis |
| `created_at` | `timestamp with tz` | `defaultNow()` |

No denormalization into `patients` table — latest analysis fetched at meal plan
time via `WHERE patient_id = ? ORDER BY analyzed_at DESC LIMIT 1`.

---

## Supabase Storage

**Bucket:** `patient-documents`
**Visibility:** Private (not public)
**File path:** `{user_id}/{patient_id}/{uuid}-{filename}`
**Max file size:** 10 MB
**Allowed types:** `image/png`, `image/jpeg`, `image/webp`

### RLS Policy

```sql
CREATE POLICY "Users own their patient documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'patient-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Environment Variable

Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` — needed for server-side storage reads
(e.g., when the meal plan route fetches the latest analysis outside the browser
session).

---

## Types

Add to `types/domain.ts`:

```typescript
type DocumentAnalysis = {
  documentType: "lab-results" | "ct-scan" | "ecg" | "other";
  summary: string;
  findings: string;
  extractedValues: Array<{
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
    interpretation: string;
  }>;
  concerns: string[];
  relevantDiagnoses: string[];
  dietaryConsiderations: string;
};

type PatientDocument = {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string;
  storagePath: string;
  analysis: DocumentAnalysis | null;
  analyzedAt: string | null;
  createdAt: string;
};
```

---

## API Routes

### `POST /api/patients/[id]/documents`
Upload + analyze. Accepts `multipart/form-data` with a single file field `file`.
Returns `{ document: PatientDocument }` with the full analysis.

Flow:
```
Auth check → patient ownership check → validate file type/size →
upload to Supabase Storage → read bytes → encode as base64 data URI →
call Groq vision model (llama-3.2-11b-vision-preview) →
parse JSON response → validate shape → INSERT into patient_documents →
return document with analysis
```

Error codes: 413 (too large), 415 (wrong type), 422 (analysis failed).

### `GET /api/patients/[id]/documents`
Returns `{ documents: PatientDocument[] }` — metadata + analysis, no file bytes.

### `GET /api/patients/[id]/documents/[docId]`
Returns `{ document: PatientDocument }`.

### `DELETE /api/patients/[id]/documents/[docId]`
Deletes from Storage bucket + DB. Returns `{ message }`.

Config changes for the upload route:
```typescript
export const maxDuration = 30; // vision call can take 5-15s
```
Route body size: Next.js API routes default to 4.5 MB. For images up to 10 MB,
add to the route:
```typescript
export const runtime = "nodejs"; // ensures no edge runtime body limits
```

---

## Meal Plan Injection

Modify `POST /api/patients/[id]/meal-plan` to inject latest lab analysis:

1. Before calling `generateRecommendations`, fetch the latest analyzed document:
   `WHERE patient_id = ? AND analyzed_at IS NOT NULL ORDER BY analyzed_at DESC LIMIT 1`
2. If found, pass `analysis.dietaryConsiderations`, `analysis.concerns`, and
   `analysis.extractedValues` into the recommendation prompt
3. No changes to `generateMealPlan` — just the prompt enrichment

Modify `generateRecommendations` to accept optional lab data:

```typescript
export async function generateRecommendations(
  patient: Patient,
  labData?: {
    extractedValues: DocumentAnalysis["extractedValues"];
    concerns: DocumentAnalysis["concerns"];
    dietaryConsiderations: DocumentAnalysis["dietaryConsiderations"];
  },
): Promise<FoodRecommendation[]>
```

When `labData` is provided, append to the AI prompt after the patient profile:
```
Latest lab values: {JSON of extractedValues}
Clinical concerns: {concerns}
Dietary considerations: {dietaryConsiderations}
```

---

## AI Prompt (Vision Analysis)

**Model:** `llama-3.2-11b-vision-preview`
**Fallback:** `llama-3.2-90b-vision-preview` (if primary fails, one retry)

System prompt asks the model to analyze the medical document and return JSON
with this structure:

```json
{
  "documentType": "lab-results",
  "summary": "2-3 sentence plain-English summary",
  "findings": "Detailed clinical findings",
  "extractedValues": [
    {
      "name": "Creatinine",
      "value": "1.2",
      "unit": "mg/dL",
      "referenceRange": "0.6-1.2",
      "isAbnormal": false,
      "interpretation": "Within normal range"
    }
  ],
  "concerns": ["Elevated blood glucose suggests poor glycemic control"],
  "relevantDiagnoses": ["Diabetes Type 2"],
  "dietaryConsiderations": "Low glycemic index foods recommended"
}
```

New file: `lib/ai/document-analyzer.ts` — contains `analyzeDocument(imageBuffer,
mimeType)` that returns `DocumentAnalysis`.

Retry logic: if `llama-3.2-11b-vision-preview` fails (non-ok response or invalid
JSON), retry once with `llama-3.2-90b-vision-preview`. If both fail, the document
is saved with `analysis: null` and `analyzed_at: null` — user can retry later.

Non-lab document types (CT scans, ECGs): `extractedValues` may be an empty array.
The UI handles this gracefully — hides the extracted values grid, shows only
summary, findings, and concerns sections.

---

## UI Components

All under `components/documents/`:

### `document-uploader.tsx`
- Drop zone + button, accepts `image/png,image/jpeg,image/webp`
- Client-side size check (< 10 MB) before upload
- Shows spinner during upload, pulse animation during analysis
- On success: renders analysis result compactly and fades in document list
- On error: shows error message with retry button
- PHI disclaimer text below the upload area

### `document-list.tsx`
- Table showing uploaded documents: thumbnail placeholder, filename, date,
  status badge (pending / analyzed), view button, delete button
- Delete triggers confirmation dialog (reuse existing pattern)

### `analysis-display.tsx`
- Card rendering `DocumentAnalysis` in readable format:
  - **Summary** paragraph (top, prominent)
  - **Extracted Values** grid — each value has name, result, unit, range,
    color indicator (green = normal, amber = borderline, red = abnormal)
  - **Concerns** bullet list
  - **Findings** section (expandable)
  - **Dietary Considerations** callout box (ties to meal plan feature)

### Route integration
Add a **Documents** tab link on the patient detail page
(`/dashboard/patients/[id]`) that navigates to
`/dashboard/patients/[id]/documents`.

New page: `app/dashboard/patients/[id]/documents/page.tsx` — server component
that renders the uploader at top, document list below.

---

## Security

- Storage bucket is private — no public URLs
- Server reads file bytes directly and sends base64 to Groq — file never
  exposed to client after upload
- RLS enforced at Storage level — user A cannot access user B's files
- `storage_path` includes `{user_id}` prefix for ownership enforcement
- Max file size enforced client-side (10 MB) and server-side (413)
- PHI redaction disclaimer on upload UI: "Remove patient names and IDs before uploading"

---

## Files Changed/Added

| File | Action |
|---|---|
| `lib/db/schema/schema.ts` | Add `patient_documents` table |
| `types/domain.ts` | Add `DocumentAnalysis`, `PatientDocument` types |
| `.env` | Add `SUPABASE_SERVICE_ROLE_KEY` |
| `lib/ai/document-analyzer.ts` | **New** — Groq vision analysis |
| `lib/db/patient-documents.ts` | **New** — DB queries for documents |
| `app/api/patients/[id]/documents/route.ts` | **New** — POST + GET list |
| `app/api/patients/[id]/documents/[docId]/route.ts` | **New** — GET + DELETE single |
| `app/api/patients/[id]/meal-plan/route.ts` | Modify — inject lab analysis |
| `lib/ai/meal-planner.ts` | Modify — optional lab params |
| `components/documents/document-uploader.tsx` | **New** |
| `components/documents/document-list.tsx` | **New** |
| `components/documents/analysis-display.tsx` | **New** |
| `app/dashboard/patients/[id]/documents/page.tsx` | **New** |
| `lib/supabase/server.ts` | Add `createAdminClient()` using service role key for server-side Storage reads |
