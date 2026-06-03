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
    await requirePatientAccess(user.id, patientId);

    let session = await getPatientSession(patientId);
    if (!session) {
      session = await createSession(user.id, patientId);
    }
    const messages = await getSessionMessages(session.id);
    return NextResponse.json({ session, messages });
  } catch (err) {
    return handleApiError(err);
  }
}
