# AI Caregiver Chat — Design Spec

## Overview

Add an AI-powered caregiver chat assistant to MediCare AI using the Vercel AI SDK (`useChat`). Two entry points:
- **Global chat** — full page at `/dashboard/chat`, general medical/caregiving Q&A
- **Per-patient chat** — right-side collapsible panel on patient pages, scoped to that patient's profile, diagnoses, meal plan, and lab results

Both persist chat history to PostgreSQL via Drizzle ORM.

---

## Data Model

### `chat_sessions`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, defaultRandom |
| user_id | uuid | FK → users.id, not null |
| patient_id | uuid | FK → patients.id, nullable (null = global session) |
| title | text | Auto-generated from first message or "Chat with AI" |
| created_at | timestamptz | defaultNow |
| updated_at | timestamptz | defaultNow |

### `chat_messages`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, defaultRandom |
| session_id | uuid | FK → chat_sessions.id, not null, onDelete cascade |
| role | text | "user" or "assistant" |
| content | text | Message body |
| created_at | timestamptz | defaultNow |

Index: `(session_id, created_at)` for efficient message loading.

---

## API Routes

### `POST /api/chat`

Create a new chat session.

**Request body:**
```json
{
  "patientId": "uuid | null"
}
```

**Response (201):**
```json
{
  "sessionId": "uuid"
}
```

### `POST /api/chat/[sessionId]`

Vercel AI SDK streaming endpoint. Receives `messages` array from `useChat`, builds system prompt, streams Groq response.

**System prompt logic:**
- If session has `patient_id`, include patient context: name, age, diagnoses, feeding method, allergies, budget, current meal plan (if any), latest lab analysis (if any)
- If global (no `patient_id`), use general medical/caregiving assistant prompt

**On receiving the request:** Save the last user message (the new one) to `chat_messages`.
**On stream completion:** Save the full AI response to `chat_messages`.

**Request body (standard `useChat`):**
```json
{
  "messages": [
    { "role": "user", "content": "..." }
  ]
}
```

**Response:** Streaming `text/plain` via Groq.

### `GET /api/chat/[sessionId]`

Return session metadata and all messages.

**Response (200):**
```json
{
  "session": { "id": "...", "patientId": "...", "title": "...", "createdAt": "..." },
  "messages": [
    { "id": "...", "role": "user", "content": "...", "createdAt": "..." }
  ]
}
```

### `GET /api/chat`

List all global (patientId IS NULL) sessions for the current user.

**Response (200):**
```json
{
  "sessions": [ ... ]
}
```

### `GET /api/patient-chat/[patientId]/session`

Get or create the single chat session for a given patient. Returns existing session if one exists, otherwise creates a new one. One session per patient — repeating this call always returns the same session.

**Response (200):**
```json
{
  "session": { "id": "...", ... },
  "messages": [ ... ]
}
```

---

## Components

### `ChatPanel`

Shared chat UI used by both global page and per-patient sidebar.

**Props:**
- `sessionId: string`
- `initialMessages: Message[]`
- `className?: string` — for layout customization

**Behavior:**
- Wraps `useChat` from `ai/react` with the session ID
- Displays messages in a scrollable container
- Shows loading indicator while streaming
- Input bar at the bottom with send button (Enter to send)
- Calls `POST /api/chat/[sessionId]` via the `api` option

### `ChatMessage`

Single message bubble.

**Props:**
- `role: "user" | "assistant"`
- `content: string`

**Styling:**
- User messages: right-aligned, primary color background
- Assistant messages: left-aligned, card/muted background
- Markdown rendering for assistant responses (simple markdown like bold, lists, code)
- Avatar/icon per role (user icon vs robot/AI icon)

### `PatientChatSidebar`

Right-side panel wrapper for the patient detail layout.

**Props:**
- `patientId: string`
- `sessionId: string`
- `messages: Message[]`

**Behavior:**
- Collapsible via a toggle button in the header
- Default state: open on desktop
- Wraps `ChatPanel` inside
- Header shows "Caregiver Chat" with collapse/expand button
- Scroll follows new messages

---

## Pages

### `/dashboard/chat/page.tsx` (Global Chat)

- Full-width page using the dashboard layout
- Left side: session list (existing conversations)
- Right side: active `ChatPanel`
- "New Chat" button to create a fresh session
- Fetches session list via `GET /api/chat`

### Patient Layout Modification

Create `/dashboard/patients/[id]/layout.tsx`.

- Wraps the existing patient detail content and the `PatientChatSidebar`
- Fetches session via `GET /api/patient-chat/[patientId]/session`
- Layout: main content left, chat panel right
- On mobile: chat panel hidden by default, toggled via button
- Sessions are auto-created per patient (one session per patient)

---

## Implementation Order

1. Schema + DB queries (`chat_sessions`, `chat_messages`, Drizzle queries)
2. API routes creation and listing (`POST /api/chat`, `GET /api/chat/[sessionId]`, `GET /api/chat`)
3. Streaming API route (`POST /api/chat/[sessionId]` with Groq)
4. Patient-scoped session endpoint (`GET /api/patient-chat/[patientId]/session`)
5. `ChatMessage` component
6. `ChatPanel` component (with `useChat`)
7. Global chat page (`/dashboard/chat`)
8. Patient layout with `PatientChatSidebar`
9. Build verification

---

## Edge Cases & Error Handling

- **No session found:** Return 404, client creates a new one
- **Patient wants fresh conversation:** No separate "clear" action in MVP — page refresh re-fetches same session (future: add clear/restart button)
- **Groq streaming fails:** Show error toast, retry button on last message
- **Empty messages:** Ignore submit if input is blank/whitespace
- **Long conversations:** Load last 50 messages initially, offer "load earlier" button
- **Concurrent sessions:** Each session is isolated — switching sessions re-initializes `useChat` with new `id`
- **Rate limiting:** Apply existing rate limiter to chat API (10 requests/min)
