import { NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

import { createClient } from "@/lib/supabase/server";
import {
  deleteSession,
  getSessionById,
  getSessionMessages,
  saveMessage,
  renameSession,
  touchSession,
} from "@/lib/db/chat";
import { buildSystemPrompt } from "@/lib/ai/chat-prompt";

type Params = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const session = await getSessionById(sessionId);

  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const messages = await getSessionMessages(sessionId);
  return NextResponse.json({ session, messages });
}

export async function DELETE(_: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const session = await getSessionById(sessionId);

  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  await deleteSession(sessionId);
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const session = await getSessionById(sessionId);

  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    messages?: Array<{
      role: string;
      content?: string;
      parts?: Array<{ type: string; text?: string }>;
    }>;
  };

  const incoming = body.messages ?? [];
  const lastUserMsg = incoming.filter((m) => m.role === "user").pop();

  const userText =
    lastUserMsg?.content?.trim() ??
    lastUserMsg?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("")
      .trim();

  if (!userText) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 },
    );
  }

  await saveMessage(sessionId, "user", userText);

  const existingMessages = await getSessionMessages(sessionId);

  // Auto-title from first message
  if (existingMessages.length === 1) {
    const title =
      userText.length > 60 ? userText.slice(0, 60) + "..." : userText;
    await renameSession(sessionId, title);
  }

  const systemPrompt = await buildSystemPrompt(user.id, session.patientId);

  // Limit context to last 30 messages
  const contextMessages = existingMessages.slice(-30);

  const result = streamText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    system: systemPrompt,
    messages: contextMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    temperature: 0.7,
    maxOutputTokens: 200,
    onFinish: async (event) => {
      try {
        await saveMessage(sessionId, "assistant", event.text);
        await touchSession(sessionId);
      } catch {
        // response saved to stream, DB persistence is non-critical
      }
    },
  });

  return result.toTextStreamResponse();
}
