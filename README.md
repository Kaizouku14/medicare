# MediCare AI

An intelligent companion for Filipino families managing the financial and medical challenges of caring for a loved one with chronic illness.

## Overview

MediCare AI helps caregivers:
- **Manage patient profiles** — diagnoses, anthropometrics, feeding method, allergies, and budget (PHP)
- **Track expenses and medications** — log daily costs, medications, and visit notes against monthly budget
- **Upload and analyze medical documents** — AI extracts lab values, flags abnormalities, and provides dietary insights from uploaded lab reports, CT scans, and ECGs
- **Generate personalized weekly meal plans** — AI creates Filipino-dish meal plans tailored to diagnoses, feeding method, allergies, lab abnormalities, medications, and budget
- **Chat with an AI care assistant** — ask questions about care, medications, nutrition, and budgets with per-patient context
- **Visualize lab trends** — track lab values over time across all analyzed documents

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui (Radix), lucide-react |
| Forms | react-hook-form + zod |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (SSR) |
| AI | Groq (llama-3.3-70b, llama-4) |
| Testing | Vitest |
| Package Manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database (or Supabase project)
- Groq API key

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
GROQ_API_KEY=
```

### Install & Run

```bash
pnpm install
pnpm db:push       # Push schema to database
pnpm db:seed       # Seed sample data
pnpm dev           # Start development server
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:push` | Push schema to database |
| `pnpm db:generate` | Generate SQL migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed database |

## Project Structure

```
app/              # Next.js App Router (pages + API routes)
components/       # React components (chat, documents, patients, ui)
lib/              # Core logic (AI, auth, db, validation, supabase)
tests/            # Vitest tests (mirrors lib/ and types/ structure)
types/            # Domain TypeScript types
data/             # Static data (diagnoses)
docs/             # Design specs and documentation
```
