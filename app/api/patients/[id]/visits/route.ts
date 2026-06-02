import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getPatientById } from "@/lib/db/patients";
import {
  createVisitNote,
  listVisitNotesByPatient,
} from "@/lib/db/visit-notes";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  const items = await listVisitNotesByPatient(patient.id);
  return NextResponse.json({ visits: items });
}

export async function POST(req: Request, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const patient = await getPatientById(user.id, id);
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  const body = await req.json();
  if (!body.date || !body.notes) {
    return NextResponse.json({ error: "Date and notes are required." }, { status: 400 });
  }

  const visit = await createVisitNote(patient.id, {
    date: body.date,
    type: body.type ?? "checkup",
    notes: body.notes,
  });

  return NextResponse.json({ visit }, { status: 201 });
}
