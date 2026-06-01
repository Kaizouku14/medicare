import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createSession, deleteSessions, listGlobalSessions } from "@/lib/db/chat";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    patientId?: string | null;
  };

  const session = await createSession(user.id, body.patientId ?? null);

  return NextResponse.json({ sessionId: session.id }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await listGlobalSessions(user.id);
  return NextResponse.json({ sessions });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    ids?: string[];
  };

  const ids = body.ids ?? [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "No session IDs provided." }, { status: 400 });
  }

  // Verify ownership of all sessions
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
}
