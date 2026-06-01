import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import {
  createSession,
  getPatientSession,
  getSessionMessages,
} from "@/lib/db/chat";

type Params = {
  params: Promise<{ patientId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { patientId } = await params;
  const patient = await getPatientById(user.id, patientId);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  let session = await getPatientSession(patientId);

  if (!session) {
    session = await createSession(user.id, patientId);
  }

  const messages = await getSessionMessages(session.id);

  return NextResponse.json({ session, messages });
}
