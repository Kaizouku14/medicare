import { NextResponse } from "next/server";

import { requireAuth, handleApiError } from "@/lib/auth";
import { getPatientChatData } from "@/lib/db/chat";

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth();

  const url = new URL(req.url);
  const patientId = url.searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json(
      { error: "patientId is required." },
      { status: 400 },
    );
  }

    const { session, messages, hasMore } = await getPatientChatData(patientId, user.id);
    return NextResponse.json({ session, messages, hasMore });
  } catch (err) {
    return handleApiError(err);
  }
}
