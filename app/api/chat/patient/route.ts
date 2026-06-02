import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPatientChatData } from "@/lib/db/chat";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}
