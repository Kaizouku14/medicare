import { NextResponse } from "next/server";

import { requireAuth, requirePatientAccess, handleApiError } from "@/lib/auth";
import {
  createSession,
  getPatientSession,
  getSessionMessages,
} from "@/lib/db/chat";

type Params = {
  params: Promise<{ patientId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const [{ user }, { patientId }] = await Promise.all([requireAuth(), params]);
    const [, session] = await Promise.all([
      requirePatientAccess(user.id, patientId),
      getPatientSession(patientId),
    ]);
    const resolvedSession = session ?? await createSession(user.id, patientId);
    const messages = await getSessionMessages(resolvedSession.id);
    return NextResponse.json({ session: resolvedSession, messages });
  } catch (err) {
    return handleApiError(err);
  }
}
