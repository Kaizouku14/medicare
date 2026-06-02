import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

import { requireAuth, handleApiError } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  createSession,
  deleteSessions,
  listGlobalSessions,
  saveMessage,
  renameSession,
  touchSession,
} from "@/lib/db/chat";
import { buildSystemPrompt } from "@/lib/ai/chat-prompt";

export async function POST(req: Request) {
  const { allowed } = await rateLimit("chat", { request: req, limit: 10, windowMs: 60000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  let user;
  try {
    ({ user } = await requireAuth());
  } catch (err) {
    return handleApiError(err);
  }

  const body = (await req.json().catch(() => ({}))) as {
    message?: string;
    patientId?: string | null;
  };

  const message = body.message?.trim();

  // If no message, just create an empty session (legacy path)
  if (!message) {
    const session = await createSession(user.id, body.patientId ?? null);
    return NextResponse.json({ sessionId: session.id }, { status: 201 });
  }

  // Create session + save user message + start streaming in one request
  const session = await createSession(user.id, body.patientId ?? null);
  await saveMessage(session.id, "user", message);

  const title = message.length > 60 ? message.slice(0, 60) + "..." : message;
  await renameSession(session.id, title);

  const systemPrompt = await buildSystemPrompt(user.id, session.patientId);

  const result = streamText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    system: systemPrompt,
    messages: [{ role: "user", content: message }],
    temperature: 0.7,
    maxOutputTokens: 200,
    onFinish: async (event) => {
      try {
        await saveMessage(session.id, "assistant", event.text);
        await touchSession(session.id);
      } catch {
        // non-critical
      }
    },
  });

  const streamResponse = result.toTextStreamResponse();
  const responseHeaders = new Headers(streamResponse.headers);
  responseHeaders.set("X-Session-Id", session.id);

  return new NextResponse(streamResponse.body, {
    status: 200,
    headers: responseHeaders,
  });
}

export async function GET() {
  try {
    const { user } = await requireAuth();
    const sessions = await listGlobalSessions(user.id);
    return NextResponse.json({ sessions });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const { user } = await requireAuth();
    const body = (await req.json().catch(() => ({}))) as {
      ids?: string[];
    };
    const ids = body.ids ?? [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "No session IDs provided." }, { status: 400 });
    }
    const allSessions = await listGlobalSessions(user.id);
    const ownedIds = new Set(allSessions.map((s) => s.id));
    const invalid = ids.filter((id) => !ownedIds.has(id));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: "Some sessions not found or unauthorized." },
        { status: 403 },
      );
    }
    await deleteSessions(ids);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
