# AI Context Enrichment — Design Spec

## Overview

Enrich the system prompts of both the AI meal planner and the per-patient chatbot with additional patient data (medications, visit notes, expenses, height, all analyzed documents) to improve the relevance and accuracy of AI responses. The meal planner also passes this context to the weekly meal generation step so meals respect medication constraints and lab abnormalities.

## Scope

**What changes:**
- `lib/ai/chat-prompt.ts` — chatbot system prompt builder
- `lib/ai/meal-planner.ts` — meal planner prompt builders for both recommendations and meal plan
- `app/api/patients/[id]/meal-plan/route.ts` — data fetching before calling AI
- A new DB helper `lib/db/medications.ts` export for active medication queries (if not already exported)

**What doesn't change:**
- No new tables, API routes, UI components, or pages
- No changes to the substitute endpoint or meal plan editor

---

## Chatbot (`lib/ai/chat-prompt.ts`)

The `buildSystemPrompt()` function already fetches patient profile, meal plan, and latest analyzed document. Add the following fetches and inject them into the prompt:

### Height

Add to the Patient Profile section:
```
- Height: ${patient.heightCm ? `${patient.heightCm} cm` : "Not provided"}
```

### Active Medications

Fetch active medications (no `endDate` or `endDate` in the future) via `listMedicationsByPatient()`. Display as a compact list:
```
Current Medications:
- Metformin 500mg — twice daily — oral
- Amlodipine 5mg — once daily — oral
```

### Recent Visit Notes

Fetch last 5 visit notes, most recent first. Include date, type, and notes summary:
```
Recent Visit Notes:
- 2026-05-28 (check-up): BP 130/85, patient reports good appetite
- 2026-05-15 (follow-up): HbA1c improved to 7.1
```

### Expenses This Month

Fetch current month's expenses, calculate total vs monthly budget, include transaction count:
```
Budget: ₱1,250 spent of ₱8,000 budget (16%) — 8 transactions this month
```

### Full Analyzed Documents (All)

Previously only included the latest analyzed doc. Change to include abnormal values from ALL analyzed documents, grouped by file name. Full summary and findings still from the latest doc only:
```
All Lab Results — Abnormal Values:
- lab_results_june.pdf:
  - Fasting Blood Sugar: 180 mg/dL (ref: 70-110) — Elevated
  - LDL Cholesterol: 160 mg/dL (ref: <100) — Elevated
- ct_scan_notes.pdf:
  - No abnormal values

Latest Lab Results (lab_results_june.pdf):
Summary: ...
Findings: ...
Concerns: ...
Dietary considerations: ...
```

### Excluded

Full meal plan per-day breakdown and recipes — skipped to keep prompt under token limits.

---

## Meal Planner

### `app/api/patients/[id]/meal-plan/route.ts`

The POST handler currently fetches the patient and `getLatestAnalyzedDocument()`. Extend to also fetch:
- Active medications via `listMedicationsByPatient()`
- All analyzed documents via `listDocumentsByPatient()` (for abnormal values)

Pass these alongside the existing `labData` to `generateRecommendations()` and `generateMealPlan()`.

### `lib/ai/meal-planner.ts`

#### `generateRecommendations()`

Signature adds two optional parameters:
```ts
medications?: { name: string; dosage: string; frequency: string; route: string }[]
allAbnormalValues?: { fileName: string; values: { name: string; value: string; unit: string; referenceRange: string; interpretation: string }[] }[]
```

The prompt gains two sections after the existing profile block:

**Active Medications section:**
```
Active Medications:
- Metformin 500mg — twice daily
- Amlodipine 5mg — once daily
```

**All Lab Results — Abnormal Values section:**
```
All Lab Results — Abnormal Values:
- lab_results_june.pdf:
  - Fasting Blood Sugar: 180 mg/dL (ref: 70-110) — Elevated
```

Add a consideration bullet:
```
6. Active medications and lab abnormalities — recommend foods that don't interfere with medications and address abnormal values
```

#### `generateMealPlan()`

Signature adds the same two optional parameters. The prompt already includes the patient profile and recommendations. Add the same medications and abnormal values sections after the patient profile, plus an additional rule:
```
7. Meal timing and portion sizes should account for the patient's medication schedule and lab abnormalities listed above
```

---

## Data Flow

```
Route (POST /api/patients/[id]/meal-plan)
  │
  ├─ getPatientById()          ── existing
  ├─ getLatestAnalyzedDocument() ── existing
  ├─ listMedicationsByPatient()  ── new fetch
  └─ listDocumentsByPatient()    ── existing (currently unused)
       │
       ▼
  generateRecommendations(patient, labData, medications, allAbnormalValues)
       │
       ▼
  generateMealPlan(patient, recommendations, medications, allAbnormalValues)
```

```
Chatbot (buildSystemPrompt)
  │
  ├─ getPatientById()          ── existing
  ├─ getLatestMealPlan()        ── existing
  ├─ listDocumentsByPatient()   ── existing (currently only takes latest)
  ├─ listMedicationsByPatient() ── new fetch
  ├─ listVisitNotesByPatient()  ── new fetch (last 5)
  └─ getExpensesByPatient()     ── new fetch (this month only)
       │
       ▼
  Builds system prompt with all sections
```

## Token Budget

Estimated additions:
- Medications: ~60-100 tokens
- Visit notes (5): ~120-200 tokens
- Expenses: ~30 tokens
- Height: ~10 tokens
- Multiple doc abnormal values: ~100-300 tokens
- Meal planner medication/doc section: ~60-200 tokens

Total: ~400-800 additional tokens per prompt. Both the chatbot (~1500 current) and meal planner (~1000 current) stay well within model limits (4096 for json mode, 8192 for chat).
