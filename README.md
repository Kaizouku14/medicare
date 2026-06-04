# MediCare AI

**AI-powered caregiving assistant for Filipino families managing chronic illness.**

MediCare AI helps caregivers navigate the medical and financial challenges of caring for a loved one — with personalized meal planning, medical document analysis, expense tracking, and an AI chat assistant that understands each patient's full clinical profile.

---

## Features

- **Patient Profiles** — Manage diagnoses, anthropometrics, feeding method (oral/NGT-soft/NGT-pureed), allergies, intolerances, and monthly budget in PHP.
- **Medical Document Analysis** — Upload lab results, CT scans, and ECGs (PNG/JPEG/WebP/PDF). AI extracts lab values, flags abnormalities, identifies relevant diagnoses, and provides dietary considerations. Text-based PDFs are read directly; images use Groq Vision.
- **Personalized Meal Plans** — AI generates 7-day Filipino meal plans tailored to the patient's diagnoses, feeding method, allergies, lab abnormalities, active medications, and budget. Supports in-place food substitution with structured food IDs and allergen checking.
- **Expense & Medication Tracking** — Log daily costs, medications, and visit notes. Track spending against the monthly budget.
- **Lab Trend Visualization** — Track lab values over time across all analyzed documents.
- **AI Chat Assistant** — Per-patient chat with RAG (vector search on visit notes, document analyses, and chat history). Full conversation history with automatic summarization for long sessions.
- **Authentication** — Email/password auth via Supabase with login, signup, forgot/reset password flows.
---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix primitives), lucide-react |
| Forms | react-hook-form + zod |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (SSR) |
| AI Provider | Groq Cloud |
| Chat Model | `meta-llama/llama-4-scout-17b-16e-instruct` |
| JSON Model | `meta-llama/llama-3.3-70b-versatile` |
| Vision Model | `meta-llama/llama-4-scout-17b-16e-instruct` (fallback: `maverick`) |
| Embeddings | `all-MiniLM-L6-v2` via Hugging Face Inference API (384-dim, pgvector) |
| Document Text | pdfjs-dist (text-based PDF extraction) |
| Testing | Vitest |
| Package Manager | pnpm |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App Router               │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │   Pages  │  │API Routes│  │   Server Actions  │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│         │             │                │            │
│  ┌──────┴─────────────┴────────────────┴──────┐     │
│  │              Service Layer                 │     │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐  │     │
│  │  │ AI       │ │ DB       │ │ Auth       │  │     │
│  │  │ Services │ │ (Drizzle)│ │ (Supabase) │  │     │
│  │  └──────────┘ └──────────┘ └────────────┘  │     │
│  └────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### Key Services

| Service | Location | Responsibility |
|---|---|---|
| **Meal Planner** | `lib/ai/services/meal-planner.ts` | Generates food recommendations + 7-day meal plan in a single AI call |
| **Document Analyzer** | `lib/ai/services/document-analyzer.ts` | Analyzes medical images/PDFs via Groq Vision or text model |
| **Chat (RAG)** | `lib/ai/prompts/chat-prompt.ts` | Builds system prompt with patient context + vector search results |
| **Vector Search** | `lib/ai/retrieval/search-patient-context.ts` | pgvector similarity search on visit notes, documents, and chat history |
| **Conversation Summary** | `lib/ai/services/conversation-summary.ts` | Condenses overflow chat messages when context window is exceeded |
| **Food Registry** | `lib/foods/registry.ts` | Canonical food IDs for structured substitution matching |

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- **pnpm** (`npm install -g pnpm`)
- **Supabase project** (or any PostgreSQL database with pgvector)
- **Groq API key** ([console.groq.com](https://console.groq.com))
- **Hugging Face API key** (free tier, for embeddings: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))

### Environment Variables

Copy `.env.example` to `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
GROQ_API_KEY=gsk_your-groq-key
HF_API_KEY=hf_your-huggingface-token
```

### Install & Run

```bash
pnpm install
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run pending migrations
pnpm db:seed          # Seed sample data
pnpm dev              # Start development server
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests (single run) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:generate` | Generate SQL migration files |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed database with sample data |

---

## Project Structure

```
app/
├── (auth)/                  # Login, signup, password reset pages
├── api/                     # API routes (chat, patients, auth)
├── dashboard/               # Dashboard pages
└── layout.tsx               # Root layout

components/
├── chat/                    # Chat panel UI
├── documents/               # Document upload, list, analysis display
├── patients/                # Patient forms, meal plans, expenses, medications
└── ui/                      # shadcn/ui primitives

lib/
├── ai/
│   ├── embeddings/          # Hugging Face embedding client + storage
│   ├── prompts/             # System prompt builders (chat, RAG)
│   ├── retrieval/           # pgvector search
│   └── services/            # Meal planner, document analyzer, conversation summary
├── auth.ts                  # Server-side auth helpers
├── db/
│   ├── chat/                # Chat message/session queries
│   ├── migrations/          # SQL migration files
│   ├── patients/            # Patient, document, expense, medication queries
│   ├── schema/              # Drizzle schema definitions
│   └── seed.ts              # Sample data
├── foods/registry.ts        # Canonical food ID registry
├── rate-limit.ts            # In-memory + Vercel Firewall rate limiter
├── sse.ts                   # SSE streaming helpers
└── supabase/                # Supabase client factories

tests/
├── lib/                     # Mirrors lib/ structure
└── types/                   # Type guard tests

types/domain.ts              # Domain type definitions
```

---

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/*` | POST | Login, signup, forgot/reset password |
| `/api/chat` | POST/GET/DELETE | Global chat sessions |
| `/api/chat/[sessionId]` | GET/POST/DELETE | Session messages (streaming AI responses) |
| `/api/chat/patient` | GET | Patient-bound chat session |
| `/api/patients/[id]` | GET/PUT | Patient CRUD |
| `/api/patients/[id]/documents` | GET/POST | Upload & analyze medical documents |
| `/api/patients/[id]/documents/[docId]` | GET/POST/DELETE | Re-analyze or delete documents |
| `/api/patients/[id]/meal-plan` | GET/POST/DELETE | Generate (SSE streaming) & retrieve meal plans |
| `/api/patients/[id]/meal-plan/edit` | PUT | Edit saved meal plan |
| `/api/patients/[id]/meal-plan/substitute` | POST | AI-suggested food substitutions (rate-limited) |
| `/api/patients/[id]/meal-plan/allergen-check` | POST | Flag allergen issues (rate-limited) |
| `/api/patients/[id]/detect-diagnoses` | POST | Suggest new diagnoses from document analysis (rate-limited) |
| `/api/patients/[id]/expenses` | GET/POST | Expense tracking |
| `/api/patients/[id]/medications` | GET/POST | Medication management |
| `/api/patients/[id]/visits` | GET/POST | Visit notes |

---

## Database Migrations

Migrations live in `lib/db/migrations/`. Current schema includes tables for:

- `patients`, `patient_documents`, `patient_embeddings` — patient data + vector embeddings
- `meal_plans` — AI-generated weekly plans
- `chat_sessions`, `chat_messages` — conversation history
- `expenses`, `medications`, `visit_notes` — tracking
- `patient_search_index` (full-text search view) — deprecated (vector search preferred)
- `pgvector` extension — powers semantic search

Run migrations with `pnpm db:migrate`.

---

## Testing

```bash
pnpm test         # 119+ tests across AI, DB, API, and type modules
pnpm test:watch   # Watch mode for TDD
```

### Test Areas

| Area | Tests | What's Covered |
|---|---|---|
| AI Services | Meal planner type guards, embedding client, vector search, chat prompt injection | Input validation, API error handling, empty/edge cases |
| Food Registry | Lookup by ID, by name, search, category filter | All 60 canonical foods, misspellings, partial matches |
| Auth | Backend helpers | requireAuth, requirePatientAccess, handleApiError |
| Type Guards | isDocumentAnalysis, isFoodRecArray, isDayMealArray | Valid/invalid/missing field coverage |

---

## Limitations

- **Image-based PDFs** (scanned documents) are not supported — only text-based PDFs can be analyzed
- **DICOM medical imaging format** is not supported — convert to PNG/JPEG
- **File size limits**: 3 MB (client), 10 MB (server); Groq Vision has a 4 MB base64 limit (~3 MB raw image)
- **Rate limits**: 5 requests/minute for document uploads, meal plans, allergen checks, and diagnoses; 10/minute for chat and substitutions
- **Embedding API** (Hugging Face free tier) may be slow or unavailable — chat degrades gracefully by skipping RAG search

---

## License

Private — internal use.
